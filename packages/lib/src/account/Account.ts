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
    LookupAddress,
    ResolveName,
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
    address: string;
    profile?: UserProfile;
}

/**
 * signs a profile with an ethereum account key
 * @param stringifiedProfile stringified dm3 user profile object
 */
export function getProfileCreationMessage(stringifiedProfile: string) {
    return `Hearby your dm3 profile is linked with your Ethereum account\n\n ${stringifiedProfile}`;
}

export async function getContacts(
    connection: Connection,
    deliveryServiceToken: string,
    getUserProfile: GetUserProfile,
    getPendingConversations: GetPendingConversations,
    resolveName: ResolveName,
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
                    connection.account!.address,
                    pendingConversation,
                ),
            )
        ) {
            await addContact(
                connection,
                pendingConversation,
                resolveName,
                userDb,
                createEmptyConversationEntry,
            );
        }
    }

    // fetch the user profile of the contacts
    const uncheckedProfiles = await Promise.all(
        Array.from(userDb.conversations.keys())
            .map((conversationId) => conversationId.split(','))
            .map((addresses) =>
                formatAddress(connection.account!.address) ===
                formatAddress(addresses[0])
                    ? formatAddress(addresses[1])
                    : formatAddress(addresses[0]),
            )
            .map(async (address) => {
                const profile = await getUserProfile(connection, address);
                return {
                    address,
                    profile: profile,
                };
            }),
    );

    // accept if account has a profile and a valid signature
    // accept if there is no profile and no signature
    return uncheckedProfiles
        .filter(
            (uncheckedProfile) =>
                (uncheckedProfile.profile &&
                    checkUserProfile(
                        uncheckedProfile.profile,
                        uncheckedProfile.address,
                    )) ||
                !uncheckedProfile.profile,
        )
        .map((profileContainer) => ({
            address: profileContainer.address,
            profile: profileContainer.profile?.profile,
        }));
}

/**
 * make too long names shorter
 * @param accountAddress ethereum account address
 * @param ensNames ENS name cache
 * @param forFile Use shortend name for a file name
 */
export function getAccountDisplayName(
    accountAddress: string | undefined,
    ensNames: Map<string, string>,
    forFile?: boolean,
): string {
    if (!accountAddress) {
        return '';
    }
    if (ensNames.get(accountAddress)) {
        return ensNames.get(accountAddress) as string;
    }
    return accountAddress.length > 10
        ? accountAddress.substring(0, 4) +
              (forFile ? '-' : '...') +
              accountAddress.substring(accountAddress.length - 4)
        : accountAddress;
}

export async function addContact(
    connection: Connection,
    accountInput: string,
    resolveName: ResolveName,
    userDb: UserDB,
    createEmptyConversationEntry: (id: string) => void,
) {
    if (ethers.utils.isAddress(accountInput)) {
        if (
            !createEmptyConversation(
                connection,
                accountInput,
                userDb,
                createEmptyConversationEntry,
            )
        ) {
            throw Error('Contact exists already.');
        }
    } else {
        const address = await resolveName(
            connection.provider as ethers.providers.JsonRpcProvider,
            accountInput,
        );
        if (address) {
            createEmptyConversation(
                connection,
                address,
                userDb,
                createEmptyConversationEntry,
            );
        } else {
            throw Error(`Couldn't resolve name`);
        }
    }
}

/**
 * check the signature of the fetched user profile
 * @param signedUserProfile The profile to check
 * @param accountAddress The Etehereum account address of the profile owner
 */
export function checkUserProfile(
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
 * @param accountAddress The Ethereum account address
 */
export function getBrowserStorageKey(accountAddress: string) {
    if (!accountAddress) {
        throw Error('No address provided');
    }
    return 'userStorageSnapshot' + formatAddress(accountAddress);
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
        'bnb.dm3.profile',
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

/**
 * creats the `dm3Hash` URI prarameter for the provided user profile
 * @param profile dm3 user profile
 */
export function createHashUrlParam(profile: SignedUserProfile): string {
    return `dm3Hash=${sha256(stringify(profile))}`;
}

export async function publishProfileOnchain(
    connection: Connection,
    url: string,
    lookupAddress: LookupAddress,
    getResolver: GetResolver,
    getConractInstance: GetConractInstance,
    getProfileOffChain: GetUserProfileOffChain,
) {
    if (!connection.provider) {
        throw Error('No provider');
    }
    if (!connection.account) {
        throw Error('No account');
    }
    const ensName = await lookupAddress(
        connection.provider,
        connection.account.address,
    );
    if (!ensName) {
        throw Error('No ENS name found');
    }

    const ethersResolver = await getResolver(connection.provider, ensName);
    if (!ethersResolver) {
        throw Error('No resolver found');
    }

    const node = ethers.utils.namehash(ensName);

    const resolver = getConractInstance(
        ethersResolver.address,
        [
            'function setText(bytes32 node, string calldata key, string calldata value) external',
        ],
        connection.provider,
    );

    const ownProfile = await getProfileOffChain(
        connection,
        connection.account,
        connection.account.address,
    );

    if (!ownProfile) {
        throw Error('could not load account profile');
    }

    if (!checkUserProfile(ownProfile, connection.account.address)) {
        throw Error('account profile check failed');
    }

    return {
        method: resolver.setText,
        args: [
            node,
            'bnb.dm3.profile',
            url + '?' + createHashUrlParam(ownProfile),
        ],
    };
}
