import {
    Account,
    normalizeEnsName,
    ProfileKeys,
} from '@dm3-org/dm3-lib-profile';
import { decrypt, encrypt, EncryptedPayload } from '@dm3-org/dm3-lib-crypto';
import { Acknoledgment } from '@dm3-org/dm3-lib-delivery';
import { Envelop, MessageState } from '@dm3-org/dm3-lib-messaging';
import { logInfo, stringify } from '@dm3-org/dm3-lib-shared';
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
    hiddenContacts: { ensName: string; aka?: string }[];
    conversationsCount: number;
    keys: ProfileKeys;
    synced: boolean;
    syncProcessState: SyncProcessState;
    lastChangeTimestamp: number;
    configViewed?: boolean;
}

export interface UserStorage {
    version: string;
    nonce: string;
    payload: EncryptedPayload;
}

interface UserStoragePayload {
    conversations: string;
    hiddenContacts: { ensName: string; aka?: string }[];
    keys: ProfileKeys;
    deliveryServiceToken: string;
    lastChangeTimestamp: number;
    configViewed?: boolean;
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
        hiddenContacts: [],
        conversationsCount: 0,
        synced: false,
        keys,
        syncProcessState: SyncProcessState.Idle,
        lastChangeTimestamp: createTimestamp(),
    };
}

export function getConversation(
    contact: string,
    contacts: Account[],
    db: UserDB,
): StorageEnvelopContainer[] {
    const contactProfile = contacts.find(
        (account) => account.ensName === contact,
    );
    if (!contactProfile) {
        throw Error(`Couldn't get contact data`);
    }

    return sortEnvelops(
        contacts
            .filter(
                (account) =>
                    contact === account.ensName ||
                    (!!account.profile &&
                        !!contactProfile.profile &&
                        stringify(account.profile) ===
                            stringify(contactProfile.profile)),
            )
            .map((account) => db.conversations.get(account.ensName) ?? [])
            .flat(),
    );
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
        hiddenContacts: userDb.hiddenContacts,
        keys: userDb.keys,
        deliveryServiceToken: token,
        lastChangeTimestamp: userDb.lastChangeTimestamp,
        configViewed: userDb.configViewed,
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
    acknowledgements: Acknoledgment[];
}> {
    if (!userDb) {
        throw Error(`User db hasn't been create`);
    }

    const acknowledgements: Acknoledgment[] = Array.from(
        userDb.conversations.keys(),
    )
        // get newest delivery service query timestamp
        .map((contactEnsName) =>
            userDb.conversations
                .get(contactEnsName)!
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
        // create acknowledgements
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
        acknowledgements,
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
    logInfo('[storage] Loading user storage');

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
        hiddenContacts: decryptedPayload.hiddenContacts,
        conversationsCount: conversations.keys.length,
        synced: true,
        syncProcessState: SyncProcessState.Idle,
        lastChangeTimestamp: decryptedPayload.lastChangeTimestamp,
        configViewed: decryptedPayload.configViewed,
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
    contactEnsName: string,
    userDb: UserDB,
    createEmptyConversationEntry: (id: string) => void,
): boolean {
    const conversationIsAlreadyKnown = userDb.conversations.has(contactEnsName);

    if (conversationIsAlreadyKnown) {
        return false;
    }

    createEmptyConversationEntry(contactEnsName);
    return true;
}
