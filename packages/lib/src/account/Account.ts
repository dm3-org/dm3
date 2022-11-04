import { ethers } from 'ethers';
import queryString from 'query-string';
import stringify from 'safe-stable-stringify';
import nacl from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';
import { GetUserProfile } from '.';
import { GetSymmetricalKeyFromSignature } from '../encryption/SymmetricalEncryption';
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
    PersonalSign,
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
import { UserProfileResolver } from './profileResolver/json/UserProfileResolver';
import { LinkResolver } from './profileResolver/LinkResolver';
import { Dm3Profile, ProfileResolver } from './profileResolver/ProfileResolver';

export interface Keys {
    publicMessagingKey: string;
    privateMessagingKey: string;
    publicSigningKey: string;
    privateSigningKey: string;
    storageEncryptionKey: string;
    storageEncryptionKeySalt: string;
}

export interface UserProfile {
    publicEncryptionKey: string;
    publicSigningKey: string;
    deliveryServices: string[];
    mutableProfileExtensionUrl?: string;
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

export async function getContacts(
    connection: Connection,
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
        userDb,
    );

    Promise.all(
        pendingConversations.map(async (address) => {
            if (
                !userDb.conversations.has(
                    getConversationId(connection.account!.address, address),
                )
            ) {
                return await addContact(
                    connection,
                    address,
                    resolveName,
                    userDb,
                    createEmptyConversationEntry,
                );
            }
            return;
        }),
    );

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

export async function createKeys(
    connection: Partial<Connection>,
    personalSign: PersonalSign,
    getSymmetricalKeyFromSignature: GetSymmetricalKeyFromSignature,
): Promise<Keys> {
    const encryptionKeyPair = nacl.box.keyPair();
    const signingKeyPair = nacl.sign.keyPair();
    const symmetricalKey = await getSymmetricalKeyFromSignature(
        connection,
        personalSign,
    );
    return {
        publicMessagingKey: encodeBase64(encryptionKeyPair.publicKey),
        privateMessagingKey: encodeBase64(encryptionKeyPair.secretKey),
        publicSigningKey: encodeBase64(signingKeyPair.publicKey),
        privateSigningKey: encodeBase64(signingKeyPair.secretKey),
        storageEncryptionKey: symmetricalKey.symmetricalKey,
        storageEncryptionKeySalt: symmetricalKey.symmetricalKeySalt,
    };
}
export type CreateKeys = typeof createKeys;

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
            if (
                !createEmptyConversation(
                    connection,
                    address,
                    userDb,
                    createEmptyConversationEntry,
                )
            ) {
                throw Error('Contact exists already.');
            }
        } else {
            throw Error(`Couldn't resolve name`);
        }
    }
}

export function checkUserProfile(
    signedUserProfile: SignedUserProfile,
    accountAddress: string,
): boolean {
    return (
        ethers.utils.recoverAddress(
            ethers.utils.hashMessage(stringify(signedUserProfile.profile)),
            signedUserProfile.signature,
        ) === formatAddress(accountAddress)
    );
}

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

export function getBrowserStorageKey(accountAddress: string) {
    if (!accountAddress) {
        throw Error('No address provided');
    }
    return 'userStorageSnapshot' + formatAddress(accountAddress);
}

export type GetResource<T> = (uri: string) => Promise<T | undefined>;

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
        'eth.dm3.profile',
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
        LinkResolver(getRessource),
        IpfsResolver(getRessource),
        UserProfileResolver(),
    ];

    return await resolver
        .find((r) => r.isProfile(textRecord))
        ?.resolveProfile(textRecord);
}

export function checkProfileHash(profile: Dm3Profile, uri: string): boolean {
    const parsedUri = queryString.parseUrl(uri);
    return sha256(stringify(profile)) === parsedUri.query.dm3Hash;
}

export function createHashUrlParam(profile: SignedUserProfile): string {
    return `dm3Hash=${sha256(stringify(profile))}`;
}

export async function publishProfileOnchain(
    connection: Connection,
    uri: string,
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
    if (ensName === null) {
        return;
    }

    const ethersResolver = await getResolver(connection.provider, ensName);
    if (ethersResolver === null) {
        return;
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
            'eth.dm3.profile',
            uri + '?' + createHashUrlParam(ownProfile),
        ],
    };
}
