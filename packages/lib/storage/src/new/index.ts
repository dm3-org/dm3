import { Envelop } from 'dm3-lib-messaging';
import { createKeyValueStore } from './KeyValueStore';
import {
    getMessageChunk,
    getNumberOfMessages,
    getConversationListChunk,
    getNumberOfConverations,
} from './read';
import {
    Chunk,
    Db,
    Encryption,
    KeyValueStore,
    ReadStrategy,
    StorageAPI,
} from './types';
import { addConversation, addMessage } from './write';
import { MAX_MESSAGES_PER_CHUNK } from './constants';

/**
 * This function creates a closure that, when invoked, adds a new conversation
 * to the database and writes the conversation list and account manifest to local storage.
 * It contains all actions which have side effects.
 *
 * @param {Db} db - The database object to interact with.
 * @returns {(contactEnsName: string) => Promise<void>} A function that takes a contactEnsName string
 *  and performs the operations.
 */
function addConversationSideEffectContainment(
    db: Db,
): (contactEnsName: string) => Promise<void> {
    return async (contactEnsName: string) => {
        const newConversationChunk = await addConversation(contactEnsName, db);
        if (newConversationChunk) {
            await db.keyValueStoreLocal.write(
                newConversationChunk.conversationList.key,
                newConversationChunk.conversationList,
            );

            // The conversation counter needs to be updated in the account manifest
            await db.keyValueStoreLocal.write(
                newConversationChunk.accountManifest.key,
                newConversationChunk.accountManifest,
            );
        }
    };
}

/**
 * This function creates a closure that, when invoked, adds a new message to a conversation
 * in the database and writes the message chunk and conversation manifest to local storage.
 * It contains all actions which have side effects.
 *
 * @param {Db} db - The database object to interact with.
 * @returns {(contactEnsName: string, envelop: Envelop) => Promise<void>} A function that takes a contactEnsName string
 *  and an Envelop object, and performs the operations.
 */
function addMessageSideEffectContainment(
    db: Db,
): (contactEnsName: string, envelop: Envelop) => Promise<void> {
    return async (contactEnsName: string, envelop: Envelop) => {
        const messageChunkContainer = await addMessage(
            contactEnsName,
            envelop,
            db,
        );
        if (messageChunkContainer) {
            await db.keyValueStoreLocal.write(
                messageChunkContainer.messageChunk.key,
                messageChunkContainer.messageChunk,
            );
            await db.keyValueStoreLocal.write(
                messageChunkContainer.conversationManifest.key,
                messageChunkContainer.conversationManifest,
            );
        }
    };
}

/**
 * This function creates a storage API for managing conversations and messages.
 * It sets up a local key-value store and a database object,
 * and returns an API with methods for getting and adding conversations and messages.
 *
 * @param {string} accountEnsName - The ENS name of the account.
 * @param {(data: string) => Promise<string>} sign - A function for signing data.
 * @param {object} options - Optional configuration options.
 * @param {ReadStrategy} options.readStrategy - The strategy to use for reading data.
 * @param {KeyValueStore} options.keyValueStoreRemote - A remote key-value store.
 * @param {Encryption} options.encryption - An encryption object.
 *
 * @returns {StorageAPI} An API with methods for getting and adding conversations and messages.
 */
export function createStorage(
    accountEnsName: string,
    sign: (data: string) => Promise<string>,
    options?: Partial<{
        readStrategy: ReadStrategy;
        keyValueStoreRemote?: KeyValueStore;
        encryption?: Encryption;
    }>,
): StorageAPI {
    const keyValueStoreLocal = createKeyValueStore();
    const db: Db = {
        readStrategy: ReadStrategy.LocalFirst,
        accountEnsName,
        keyValueStoreLocal,
        sign,
        // If we read from remote because a chunk is not available, we need to update local storage
        updateLocalStorageOnRemoteRead: options?.keyValueStoreRemote
            ? async <T extends Chunk>(key: string, value: T) => {
                  await keyValueStoreLocal.write(key, value);
              }
            : async <T extends Chunk>(key: string, value: T) => {},
        ...options,
    };

    return {
        getMessages: (contactEnsName: string, page: number) =>
            getMessageChunk(db, contactEnsName, page),

        getNumberOfMessages: (contactEnsName: string) =>
            getNumberOfMessages(contactEnsName, db),

        getConversationList: (page: number) =>
            getConversationListChunk(db, page),

        getNumberOfConverations: () => getNumberOfConverations(db),

        addConversation: addConversationSideEffectContainment(db),

        addMessage: addMessageSideEffectContainment(db),
    };
}
