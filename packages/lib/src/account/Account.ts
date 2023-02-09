import { profile } from 'console';
import { ethers } from 'ethers';
import queryString from 'query-string';
import stringify from 'safe-stable-stringify';
import { GetUserProfile } from '.';
import { KeyPair } from '../crypto';
import {
    GetPendingConversations,
    GetUserProfileOffChain,
} from '../external-apis/BackendAPI';
import {
    formatAddress,
    GetConractInstance,
    GetEnsTextRecord,
    GetResolver,
} from '../external-apis/InjectedWeb3API';
import { log } from '../shared/log';
import { sha256 } from '../shared/sha256';
import {
    createEmptyConversation,
    getConversationId,
    UserDB,
} from '../storage/Storage';
import { Connection } from '../web3-provider/Web3Provider';
import { IpfsResolver } from './profileResolver/IpfsResolver';
import { JsonResolver } from './profileResolver/JsonResolver';
import { LinkResolver } from './profileResolver/LinkResolver';
import { Dm3Profile, ProfileResolver } from './profileResolver/ProfileResolver';
import { validateSignedUserProfile } from './profileResolver/Validation';

export interface UserProfile {
    publicEncryptionKey: string;
    publicSigningKey: string;
    deliveryServices: string[];
}

export interface ProfileKeys {
    encryptionKeyPair: KeyPair;
    signingKeyPair: KeyPair;
    storageEncryptionKey: string;
    storageEncryptionNonce: number;
}

export interface SignedUserProfile {
    profile: UserProfile;
    signature: string;
}

export interface PrivateKeys {
    privateMessagingKey: string;
    privateSigningKey: string;
}

export interface Account {
    ensName: string;
    profile?: UserProfile;
    profileSignature?: string;
}

export const PROFILE_RECORD_NAME = 'network.dm3.profile';

/**
 * signs a profile with an ethereum account key
 * @param stringifiedProfile stringified dm3 user profile object
 */
export function getProfileCreationMessage(stringifiedProfile: string) {
    return `Hearby your dm3 profile is linked with your Ethereum account\n\n ${stringifiedProfile}`;
}

/**
 * normalizes an ENS name
 * @param ensName name that should be normalized
 */
export function normalizeEnsName(ensName: string): string {
    return ethers.utils.nameprep(ensName);
}

export async function getContacts(
    connection: Connection,
    deliveryServiceToken: string,
    getUserProfile: GetUserProfile,
    getPendingConversations: GetPendingConversations,
    userDb: UserDB,
    createEmptyConversationEntry: (id: string) => void,
): Promise<Account[]> {
    if (!connection.provider) {
        throw Error('No provider');
    }

    const pendingConversations = await getPendingConversations(
        connection,
        deliveryServiceToken,
    );

    for (const pendingConversation of pendingConversations) {
        if (
            !userDb.conversations.has(
                getConversationId(
                    normalizeEnsName(connection.account!.ensName),
                    pendingConversation,
                ),
            )
        ) {
            await addContact(
                connection,
                pendingConversation,
                userDb,
                createEmptyConversationEntry,
            );
        }
    }

    // fetch the user profile of the contacts
    const uncheckedProfiles = await Promise.all(
        Array.from(userDb.conversations.keys())
            .map((conversationId) => conversationId.split(','))
            .map((ensNames) =>
                normalizeEnsName(connection.account!.ensName) ===
                normalizeEnsName(ensNames[0])
                    ? normalizeEnsName(ensNames[1])
                    : normalizeEnsName(ensNames[0]),
            )
            .map(async (ensName) => {
                const profile = await getUserProfile(connection, ensName);
                return {
                    ensName,
                    profile: profile,
                };
            }),
    );

    // accept if account has a profile and a valid signature
    // accept if there is no profile and no signature
    return (
        await Promise.all(
            uncheckedProfiles.map(async (uncheckedProfile) => ({
                valid:
                    !uncheckedProfile.profile ||
                    (await checkUserProfile(
                        connection.provider!,
                        uncheckedProfile.profile,

                        uncheckedProfile.ensName,
                    )),
                container: uncheckedProfile,
            })),
        )
    )
        .filter((checkedProfile) => checkedProfile.valid)
        .map((profileContainer) => ({
            ensName: profileContainer.container.ensName,
            profile: profileContainer.container.profile?.profile,
        }));
}

/**
 * make too long names shorter
 * @param ensName The ENS name
 * @param forFile Use shortend name for a file name
 */
export function getAccountDisplayName(
    ensName: string,
    forFile?: boolean,
): string {
    const normalizedEnsName = normalizeEnsName(ensName);

    return normalizedEnsName.length > 10
        ? normalizedEnsName.substring(0, 6) +
              (forFile ? '-' : '...') +
              normalizedEnsName.substring(normalizedEnsName.length - 4)
        : normalizedEnsName;
}

export async function addContact(
    connection: Connection,
    ensName: string,
    userDb: UserDB,
    createEmptyConversationEntry: (id: string) => void,
) {
    if (
        !createEmptyConversation(
            connection,
            ensName,
            userDb,
            createEmptyConversationEntry,
        )
    ) {
        throw Error('Contact exists already.');
    }
}

/**
 * check the signature of the fetched user profile
 * @param provider Eth rpc provider
 * @param signedUserProfile The profile to check
 * @param ensName The ENS domain name
 */
export async function checkUserProfile(
    provider: ethers.providers.JsonRpcProvider,
    { profile, signature }: SignedUserProfile,
    ensName: string,
): Promise<boolean> {
    const accountAddress = await provider.resolveName(ensName);

    if (!accountAddress) {
        throw Error(`Couldn't resolve name`);
    }

    return checkUserProfileWithAddress({ profile, signature }, accountAddress);
}

/**
 * check the signature of the fetched user profile using the eth address
 * @param signedUserProfile The profile to check
 * @param accountAddress The ENS domain name
 */
export function checkUserProfileWithAddress(
    { profile, signature }: SignedUserProfile,
    accountAddress: string,
): boolean {
    const createUserProfileMessage = getProfileCreationMessage(
        stringify(profile),
    );

    return (
        ethers.utils.recoverAddress(
            ethers.utils.hashMessage(createUserProfileMessage),
            signature,
        ) === formatAddress(accountAddress)
    );
}

/**
 * check a signature by recovering the signer address
 * @param stringToCheck Signed string
 * @param signature The signature
 * @param signature The Ethereum account address of the signer
 */
export function checkStringSignature(
    stringToCheck: string,
    signature: string,
    accountAddress: string,
): boolean {
    return (
        ethers.utils.recoverAddress(
            ethers.utils.hashMessage(stringToCheck),
            signature,
        ) === formatAddress(accountAddress)
    );
}

/**
 * create the string used to create the browser storage key
 * @param ensName The ENS name
 */
export function getBrowserStorageKey(ensName: string) {
    return 'userStorageSnapshot:' + normalizeEnsName(ensName);
}

export type GetResource<T> = (uri: string) => Promise<T | undefined>;

/**
 * fetch a dm3 user profile
 * @param connection dm3 connection object
 * @param contact The Ethereum account address of the of the profile owner
 * @param getProfileOffChain Function to fetch offchain user profiles
 * @param getEnsTextRecord Function to fetch ENS text records
 * @param getRessource Function to fetch a user profile
 * @param profileUrl Offchain user profile URL
 */
export async function getUserProfile(
    connection: Connection,
    contact: string,
    getProfileOffChain: GetUserProfileOffChain,
    getEnsTextRecord: GetEnsTextRecord,
    getRessource: GetResource<SignedUserProfile>,
    profileUrl?: string,
): Promise<SignedUserProfile | undefined> {
    const textRecord = await getEnsTextRecord(
        connection.provider!,
        contact,
        PROFILE_RECORD_NAME,
    );
    //The user has no dm3-Profile text record set. Hence we need to fetch the profile offChain
    if (!textRecord) {
        log(`[getUserProfile] Offchain`);
        return getProfileOffChain(
            connection,
            connection.account,
            contact,
            profileUrl,
        );
    }
    /**
     * The Text record can contain either
     * * a link to the profile stored on a http server
     * * a link to the profile stored on ipfs
     * * The stringified profile
     */

    const resolver: ProfileResolver<SignedUserProfile>[] = [
        LinkResolver(getRessource, validateSignedUserProfile),
        IpfsResolver(getRessource, validateSignedUserProfile),
        JsonResolver(validateSignedUserProfile),
    ];

    return await resolver
        .find((r) => r.isProfile(textRecord))
        ?.resolveProfile(textRecord);
}

/**
 * checks the user profile hash contained in the `dm3Hash` URI prarameter
 * @param profile dm3 user profile
 * @param uri URI containing the `dm3Hash` prarameter
 */
export function checkProfileHash(profile: Dm3Profile, uri: string): boolean {
    const parsedUri = queryString.parseUrl(uri);
    return sha256(stringify(profile)) === parsedUri.query.dm3Hash;
}

export async function getPublishProfileOnchainTransaction(
    connection: Connection,
    ensName: string,
    getResolver: GetResolver,
    getConractInstance: GetConractInstance,
) {
    if (!connection.provider) {
        throw Error('No provider');
    }
    if (!connection.account) {
        throw Error('No account');
    }
    if (!connection.account.profile) {
        throw Error('No profile');
    }
    if (!connection.account.profileSignature) {
        throw Error('No signature');
    }

    const ethersResolver = await getResolver(connection.provider, ensName);
    if (!ethersResolver) {
        throw Error('No resolver found');
    }

    const resolver = getConractInstance(
        ethersResolver.address,
        [
            'function setText(bytes32 node, string calldata key, string calldata value) external',
        ],
        connection.provider,
    );

    const jsonPrefix = 'data:application/json,';
    const signedUserProfile: SignedUserProfile = {
        profile: connection.account.profile,
        signature: connection.account.profileSignature,
    };

    const node = ethers.utils.namehash(ensName);
    const key = 'network.dm3.profile';
    const value = jsonPrefix + stringify(signedUserProfile);

    return {
        method: resolver.setText,
        args: [node, key, value],
    };
}
