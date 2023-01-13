import { normalizeEnsName, ProfileKeys } from '../account/Account';
import { decrypt, encrypt, EncryptedPayload } from '../crypto';
import { Acknoledgment } from '../delivery';
import { Envelop } from '../messaging';
import { MessageState } from '../messaging/Message';
import { log } from '../shared/log';
import { stringify } from '../shared/stringify';
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
    keys: ProfileKeys;
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
    keys: ProfileKeys;
    deliveryServiceToken: string;
    lastChangeTimestamp: number;
}

/**
 * In order to stringify the conversations properly, 
 * the map that contains the conversations has to be transformed to the follwoing structure
 {
  "dataType": "Map",
  "value": [
    [
      "conversionID0",
      [
        [...storageEnvelopContainer]
      ]
    ],
    [
      "conversionID1",
      [
        [...storageEnvelopContainer]
      ]
    ]
  ]
}
 * 
 */
export function serializeConversations(
    _: string,
    value: Map<string, StorageEnvelopContainer[]>,
) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()),
        };
    } else {
        return value;
    }
}
/**
 * If a JSON string contains an object created with {@see serializeConversations}
 * it'll be transformed to a Map<string,StorageEnvelopContainer[]> where the key is the conversationID
 */
export function parseConversations(key: string, value: any) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}

export function createDB(keys: ProfileKeys): UserDB {
    return {
        conversations: new Map<string, StorageEnvelopContainer[]>(),
        conversationsCount: 0,
        synced: false,
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
        connection.account!.ensName,
    );
    const envelops = db.conversations.get(conversationId);
    return envelops ?? [];
}
/**
 * Sorts an Array of {@see StorageEnvelopContainer} by timestamp ASC
 */
export function sortEnvelops(
    containers: StorageEnvelopContainer[],
): StorageEnvelopContainer[] {
    return containers.sort(
        (a, b) =>
            a.envelop.message.metadata.timestamp -
            b.envelop.message.metadata.timestamp,
    );
}

function prepareUserStoragePayload(
    userDb: UserDB,
    token: string,
): UserStoragePayload {
    return {
        conversations: JSON.stringify(
            userDb.conversations,
            serializeConversations,
        ),
        keys: userDb.keys,
        deliveryServiceToken: token,
        lastChangeTimestamp: userDb.lastChangeTimestamp,
    };
}
/**
 * Sync the userDb by Acknoleding each non-empty conversation
 * @returns  an Array of Acknloedgements and an encrypted @see {UserStorage} object
 * This can be decrypted by using the @see {load} method with the according storageEncryptionKey
 *
 */
export async function sync(
    userDb: UserDB | undefined,
    deliveryServiceToken: string,
): Promise<{
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
        .map((conversationId) =>
            userDb.conversations
                .get(conversationId)!
                //TODO is it still needed to filter messages without an incomingtimestamp @Heiko
                .filter(
                    ({ deliveryServiceIncommingTimestamp }) =>
                        !!deliveryServiceIncommingTimestamp,
                )
                //Sort Messages ASC by incoming timeStamp
                .sort(
                    (a, b) =>
                        b.deliveryServiceIncommingTimestamp! -
                        a.deliveryServiceIncommingTimestamp!,
                ),
        )
        //Filter empty containers
        .filter(
            (containers): containers is StorageEnvelopContainer[] =>
                !!containers && containers.length > 0,
        )
        // create acknoledgments
        .map((containers) => ({
            contactAddress: containers[0].envelop.message.metadata.from,
            messageDeliveryServiceTimestamp:
                containers[0].deliveryServiceIncommingTimestamp!,
        }));

    return {
        userStorage: {
            version: 'dm3-encryption-1',
            nonce: userDb.keys.storageEncryptionNonce,
            payload: await encrypt(
                userDb.keys.storageEncryptionKey,
                stringify(
                    prepareUserStoragePayload(userDb, deliveryServiceToken),
                ),
            ),
        },
        acknoledgments,
    };
}
/**
 * Decryptes an encrypted @see {UserStorage}
 * @retruns The decrypted @see {UserDB}
 */
export async function load(
    data: UserStorage,
    storageEncryptionKey: string,
): Promise<UserDB> {
    log('[storage] Loading user storage');

    const decryptedPayload: UserStoragePayload = JSON.parse(
        await decrypt(storageEncryptionKey, data.payload),
    );

    const conversations: Map<string, StorageEnvelopContainer[]> = JSON.parse(
        decryptedPayload.conversations,
        parseConversations,
    );

    return {
        keys: decryptedPayload.keys,
        conversations,
        conversationsCount: conversations.keys.length,
        synced: true,
        syncProcessState: SyncProcessState.Idle,
        lastChangeTimestamp: decryptedPayload.lastChangeTimestamp,
    };
}

export function getConversationId(ensNameA: string, ensNameB: string): string {
    return [normalizeEnsName(ensNameA), normalizeEnsName(ensNameB)]
        .sort()
        .join();
}
/**
 * Creates a new conversation entry if the conversationId not yet known.
 * If the conversationId was used previously the function returns false
 * @returns An boolean that indicates if a new conversion was created
 */
export function createEmptyConversation(
    connection: Connection,
    ensName: string,
    userDb: UserDB,
    createEmptyConversationEntry: (id: string) => void,
): boolean {
    const conversationId = getConversationId(
        connection.account!.ensName,
        ensName,
    );
    const conversationIsAlreadyKnown = userDb.conversations.has(conversationId);

    if (conversationIsAlreadyKnown) {
        return false;
    }

    createEmptyConversationEntry(conversationId);
    return true;
}
