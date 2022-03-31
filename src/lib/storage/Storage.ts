import { ethers } from 'ethers';
import { Keys } from '../account/Account';
import { encryptSafely, EthEncryptedData } from '../encryption/Encryption';
import {
    symmetricalDecrypt,
    symmetricalEncrypt,
} from '../encryption/SymmetricalEncryption';
import {
    decryptUsingProvider,
    formatAddress,
} from '../external-apis/InjectedWeb3API';
import { Envelop, getId, MessageState } from '../messaging/Messaging';
import { Connection } from '../web3-provider/Web3Provider';

export enum StorageLocation {
    File = 'File',
    Web3Storage = 'Web3 Storage',
}

export interface StorageEnvelopContainer {
    messageState: MessageState;
    envelop: Envelop;
}

export interface UserDB {
    conversations: Map<string, StorageEnvelopContainer[]>;
    conversationsCount: number;
    deliveryServiceToken: string;
    keys: Keys;
    synced: boolean;
    syncingInProgress: boolean;
}

export interface UserStorage {
    version: string;
    storageEncryptionKey: EthEncryptedData;
    userStorage: string;
}

function replacer(key: string, value: any) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()),
        };
    } else {
        return value;
    }
}

function reviver(key: string, value: any) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}

export function createDB(keys: Keys, deliveryServiceToken: string): UserDB {
    return {
        conversations: new Map<string, StorageEnvelopContainer[]>(),
        conversationsCount: 0,
        synced: false,
        deliveryServiceToken,
        keys,
        syncingInProgress: false,
    };
}

export function getConversation(
    contact: string,
    connection: Connection,
    db: UserDB,
): StorageEnvelopContainer[] {
    const conversationId = getConversationId(
        contact,
        connection.account!.address,
    );
    const envelops = db.conversations.get(conversationId);
    return envelops ? envelops : [];
}

export function sortEnvelops(
    containers: StorageEnvelopContainer[],
): StorageEnvelopContainer[] {
    return containers.sort(
        (a, b) => a.envelop.message.timestamp - b.envelop.message.timestamp,
    );
}

export function sync(userDb: UserDB | undefined): UserStorage {
    if (!userDb) {
        throw Error(`User db hasn't been create`);
    }

    if (!userDb.keys?.publicKey) {
        throw Error('No key to encrypt');
    }

    return {
        version: 'ens-mail-encryption-1',
        storageEncryptionKey: encryptSafely({
            publicKey: userDb.keys.publicKey,
            data: userDb.keys.storageEncryptionKey,
            version: 'x25519-xsalsa20-poly1305',
        }),
        userStorage: symmetricalEncrypt(
            JSON.stringify({
                conversations: JSON.stringify(userDb.conversations, replacer),
                keys: userDb.keys,
                deliveryServiceToken: userDb.deliveryServiceToken,
            }),
            userDb.keys.storageEncryptionKey,
        ),
    };
}

export async function load(
    connection: Connection,
    data: UserStorage,
): Promise<UserDB> {
    const storageEncryptionKey = JSON.parse(
        await decryptUsingProvider(
            connection.provider!,
            ethers.utils.hexlify(
                ethers.utils.toUtf8Bytes(
                    JSON.stringify(data.storageEncryptionKey),
                ),
            ),

            connection.account!.address,
        ),
    ).data;
    const decryptedPayload = JSON.parse(
        symmetricalDecrypt(data.userStorage, storageEncryptionKey),
    );

    const conversations: Map<string, StorageEnvelopContainer[]> = JSON.parse(
        decryptedPayload.conversations,
        reviver,
    );

    return {
        keys: decryptedPayload.keys,
        deliveryServiceToken: decryptedPayload.deliveryServiceToken,
        conversations,
        conversationsCount: conversations.keys.length,
        synced: true,
        syncingInProgress: false,
    };
}

export function getConversationId(accountA: string, accountB: string): string {
    return [formatAddress(accountA), formatAddress(accountB)].sort().join();
}

export function createEmptyConversation(
    connection: Connection,
    accountAddress: string,
    userDb: UserDB,
    createEmptyConversationEntry: (id: string) => void,
): boolean {
    const conversationId = getConversationId(
        connection.account!.address,
        accountAddress,
    );
    const isNewConversation = !userDb.conversations.has(conversationId);
    if (isNewConversation) {
        createEmptyConversationEntry(conversationId);
    }

    return isNewConversation;
}
