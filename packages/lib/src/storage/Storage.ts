import { stringify } from '../shared/stringify';
import { Keys } from '../account/Account';
import { decrypt, encrypt, EncryptedPayload } from '../crypto';
import { Acknoledgment } from '../delivery';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { Envelop, MessageState } from '../messaging/Messaging';
import { log } from '../shared/log';
import { Connection } from '../web3-provider/Web3Provider';
import { createTimestamp } from './Utils';

export enum StorageLocation {
    File = 'File',
    Web3Storage = 'Web3 Storage',
    GoogleDrive = 'Google Drive',
    dm3Storage = 'dm3 Storage',
}

export enum SyncProcessState {
    Idle = 'IDLE',
    Running = 'RUNNING',
    Failed = 'FAILED',
}

export interface StorageEnvelopContainer {
    messageState: MessageState;
    envelop: Envelop;
    deliveryServiceIncommingTimestamp?: number;
}

export interface UserDB {
    conversations: Map<string, StorageEnvelopContainer[]>;
    conversationsCount: number;
    deliveryServiceToken: string;
    keys: Keys;
    synced: boolean;
    syncProcessState: SyncProcessState;
    lastChangeTimestamp: number;
}

export interface UserStorage {
    version: string;
    nonce: number;
    payload: EncryptedPayload;
}

interface UserStoragePayload {
    conversations: string;
    keys: Keys;
    deliveryServiceToken: string;
    lastChangeTimestamp: number;
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
        syncProcessState: SyncProcessState.Idle,
        lastChangeTimestamp: createTimestamp(),
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

function prepareUserStoragePayload(userDb: UserDB): UserStoragePayload {
    return {
        conversations: JSON.stringify(userDb.conversations, replacer),
        keys: userDb.keys,
        deliveryServiceToken: userDb.deliveryServiceToken,
        lastChangeTimestamp: userDb.lastChangeTimestamp,
    };
}

export async function sync(userDb: UserDB | undefined): Promise<{
    userStorage: UserStorage;
    acknoledgments: Acknoledgment[];
}> {
    if (!userDb) {
        throw Error(`User db hasn't been create`);
    }

    const acknoledgments: Acknoledgment[] = Array.from(
        userDb.conversations.keys(),
    )
        // get newest delivery service query timestamp
        .map((key) =>
            userDb.conversations
                .get(key)
                ?.filter((container) =>
                    container.deliveryServiceIncommingTimestamp ? true : false,
                )
                .sort(
                    (a, b) =>
                        b.deliveryServiceIncommingTimestamp! -
                        a.deliveryServiceIncommingTimestamp!,
                ),
        )
        // create acknoledgments
        .map(
            (containers) =>
                containers && containers.length > 0
                    ? {
                          contactAddress: containers[0]!.envelop.message.from,
                          messageDeliveryServiceTimestamp:
                              containers[0].deliveryServiceIncommingTimestamp!,
                      }
                    : null,
            // remove null acknoledgments
        )
        .filter((acknoledgment) =>
            acknoledgment ? true : false,
        ) as Acknoledgment[];

    return {
        userStorage: {
            version: 'dm3-encryption-1',
            nonce: userDb.keys.storageEncryptionNonce,
            payload: await encrypt(
                userDb.keys.storageEncryptionKey,
                stringify(prepareUserStoragePayload(userDb)),
            ),
        },
        acknoledgments,
    };
}

export async function load(data: UserStorage, key: string): Promise<UserDB> {
    log('[storage] Loading user storage');

    const decryptedPayload: UserStoragePayload = JSON.parse(
        await decrypt(key, data.payload),
    );

    const conversations: Map<string, StorageEnvelopContainer[]> = JSON.parse(
        decryptedPayload.conversations,
        reviver,
    );

    return {
        keys: decryptedPayload.keys,
        deliveryServiceToken: decryptedPayload.deliveryServiceToken,
        conversations,
        conversationsCount: conversations.keys ? conversations.keys.length : 0,
        synced: true,
        syncProcessState: SyncProcessState.Idle,
        lastChangeTimestamp: decryptedPayload.lastChangeTimestamp,
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
