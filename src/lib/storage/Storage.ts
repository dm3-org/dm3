import { ethers } from 'ethers';
import { Keys } from '../account/Account';
import { encryptSafely, EthEncryptedData } from '../encryption/Encryption';
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

// export function storeMessages(
//     containers: StorageEnvelopContainer[],
//     connection: Connection,
//     db: UserDB,
// ): {
//     conversations: Map<string, StorageEnvelopContainer[]>;
//     hasChanged: boolean;
// } {
//     let hasChanged = false;
//     const conversations = new Map<string, StorageEnvelopContainer[]>(
//         db.conversations,
//     );

//     for (let container of containers) {

//     }

//     return { conversations, hasChanged };
// }

export function sync(
    connection: Connection,
    userDb: UserDB | undefined,
): {
    version: string;
    payload: EthEncryptedData;
} {
    if (!userDb) {
        throw Error(`User db hasn't been create`);
    }

    if (!userDb.keys?.publicKey) {
        throw Error('No key to encrypt');
    }

    const payload = encryptSafely({
        publicKey: userDb.keys?.publicKey,
        data: JSON.stringify({
            conversations: JSON.stringify(userDb.conversations, replacer),
            keys: userDb.keys,
            deliveryServiceToken: userDb.deliveryServiceToken,
        }),
        version: 'x25519-xsalsa20-poly1305',
    });

    return {
        version: 'ens-mail-encryption-1',
        payload,
    };
}

export async function load(
    connection: Connection,
    data: {
        version: string;
        payload: EthEncryptedData;
    },
): Promise<UserDB> {
    const decryptedPayload: {
        conversations: string;
        keys: Keys;
        deliveryServiceToken: string;
    } = JSON.parse(
        JSON.parse(
            await decryptUsingProvider(
                connection.provider!,
                ethers.utils.hexlify(
                    ethers.utils.toUtf8Bytes(JSON.stringify(data.payload)),
                ),

                connection.account!.address,
            ),
        ).data,
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
