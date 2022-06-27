import { ethers } from 'ethers';
import {
    formatAddress,
    GetConractInstance,
    GetEnsTextRecord,
    GetResolver,
    LookupAddress,
    ResolveName,
} from '../external-apis/InjectedWeb3API';
import { Connection } from '../web3-provider/Web3Provider';
import nacl from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';
import {
    createEmptyConversation,
    getConversationId,
    UserDB,
} from '../storage/Storage';
import { generateSymmetricalKey } from '../encryption/SymmetricalEncryption';
import {
    GetPendingConversations,
    GetProfileRegistryEntryOffChain,
} from '../external-apis/BackendAPI';
import { GetProfileRegistryEntry } from '..';
import { log } from '../shared/log';

export interface Keys {
    publicKey: string;
    publicMessagingKey: string;
    privateMessagingKey: string;
    publicSigningKey: string;
    privateSigningKey: string;
    storageEncryptionKey: string;
}

export interface ProfileRegistryEntry {
    publicKeys: PublicKeys;
    headTrackerUri?: string;
}

export interface SignedProfileRegistryEntry {
    profileRegistryEntry: ProfileRegistryEntry;
    signature: string;
}

export interface PublicKeys {
    publicKey: string;
    publicMessagingKey: string;

    publicSigningKey: string;
}

export interface PrivateKeys {
    privateMessagingKey: string;
    privateSigningKey: string;
}

export interface Account {
    address: string;
    publicKeys?: PublicKeys;
}

export async function getContacts(
    connection: Connection,
    getProfileRegistryEntry: GetProfileRegistryEntry,
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
                const profile = await getProfileRegistryEntry(
                    connection.provider!,
                    address,
                );
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
                    checkProfileRegistryEntry(
                        uncheckedProfile.profile,
                        uncheckedProfile.address,
                    )) ||
                !uncheckedProfile.profile,
        )
        .map((profileContainer) => ({
            address: profileContainer.address,
            publicKeys:
                profileContainer.profile?.profileRegistryEntry.publicKeys,
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

export function createKeys(encryptionPublicKey: string): Keys {
    const encryptionKeyPair = nacl.box.keyPair();
    const signingKeyPair = nacl.sign.keyPair();
    return {
        publicKey: encryptionPublicKey,
        publicMessagingKey: encodeBase64(encryptionKeyPair.publicKey),
        privateMessagingKey: encodeBase64(encryptionKeyPair.secretKey),
        publicSigningKey: encodeBase64(signingKeyPair.publicKey),
        privateSigningKey: encodeBase64(signingKeyPair.secretKey),
        storageEncryptionKey: generateSymmetricalKey(),
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

export function extractPublicKeys(keys: Keys): PublicKeys {
    return {
        publicKey: keys.publicKey,
        publicMessagingKey: keys.publicMessagingKey,
        publicSigningKey: keys.publicSigningKey,
    };
}

export function checkProfileRegistryEntry(
    signedProfileRegistryEntry: SignedProfileRegistryEntry,
    accountAddress: string,
): boolean {
    return (
        ethers.utils.recoverAddress(
            ethers.utils.hashMessage(
                JSON.stringify(signedProfileRegistryEntry.profileRegistryEntry),
            ),
            signedProfileRegistryEntry.signature,
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

export async function getProfileRegistryEntry(
    provider: ethers.providers.JsonRpcProvider,
    contact: string,
    getProfileOffChain: GetProfileRegistryEntryOffChain,
    getEnsTextRecord: GetEnsTextRecord,
    getRessource: (
        uri: string,
    ) => Promise<SignedProfileRegistryEntry | undefined>,
): Promise<SignedProfileRegistryEntry | undefined> {
    const uri = await getEnsTextRecord(provider, contact, 'eth.mail');

    if (uri) {
        log(`[getProfileRegistryEntry] Onchain uri ${uri}`);
        return getRessource(uri);
    } else {
        log(`[getProfileRegistryEntry] Offchain`);
        return getProfileOffChain(contact);
    }
}

export async function publishProfileOnchain(
    connection: Connection,
    uri: string,
    lookupAddress: LookupAddress,
    getResolver: GetResolver,
    getConractInstance: GetConractInstance,
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

    return {
        method: resolver.setText,
        args: [node, 'eth.mail', uri],
    };
}
