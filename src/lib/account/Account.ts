import { ethers } from 'ethers';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { Connection } from '../web3-provider/Web3Provider';
import nacl from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';
import {
    createEmptyConversation,
    getConversationId,
    UserDB,
} from '../storage/Storage';
import { generateSymmetricalKey } from '../encryption/SymmetricalEncryption';

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
    deliveryServiceToken: string,
    getProfileRegistryEntry: (
        contact: string,
    ) => Promise<
        | { profileRegistryEntry: ProfileRegistryEntry; signature: string }
        | undefined
    >,
    getPendingConversations: (
        connection: Connection,
        userDb: UserDB,
    ) => Promise<string[]>,
    resolveName: (
        provider: ethers.providers.JsonRpcProvider,
        name: string,
    ) => Promise<string | null>,
    userDb: UserDB,
    createEmptyConversationEntry: (id: string) => void,
): Promise<Account[]> {
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

    return await Promise.all(
        Array.from(userDb.conversations.keys())
            .map((conversationId) => conversationId.split(','))
            .map((addresses) =>
                formatAddress(connection.account!.address) ===
                formatAddress(addresses[0])
                    ? formatAddress(addresses[1])
                    : formatAddress(addresses[0]),
            )
            .map(async (address) => ({
                address,
                publicKeys: (
                    await getProfileRegistryEntry(address)
                )?.profileRegistryEntry.publicKeys,
            })),
    );
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

export async function addContact(
    connection: Connection,
    accountInput: string,
    resolveName: (
        provider: ethers.providers.JsonRpcProvider,
        name: string,
    ) => Promise<string | null>,
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
