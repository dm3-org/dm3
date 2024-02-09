/* eslint-disable max-len */
import { Envelop } from '@dm3-org/dm3-lib-messaging';
import { createKeyValueStore } from './KeyValueStore';
import { getConversationManifestKey } from './keys';
import {
    getConversationListChunk,
    getConversationManifest,
    getMessageChunk,
    getNumberOfConverations,
    getNumberOfMessages,
} from './read';
import {
    Chunk,
    Conversation,
    Db,
    Encryption,
    INITIAL_CONVERSATION_MANIFEST,
    KeyValueStore,
    ReadStrategy,
    StorageAPI,
    StorageEnvelopContainer,
} from './types';
import {
    addConversation,
    addMessages,
    editMessage as editMessages,
} from './write';

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

        //Add the conversation list to the local storage
        await db.keyValueStoreLocal.write(
            newConversationChunk.conversationList.key,
            newConversationChunk.conversationList,
        );

        // Increment the conversation list counter in the account manifest and add it to the local storage
        await db.keyValueStoreLocal.write(
            newConversationChunk.accountManifest.key,
            newConversationChunk.accountManifest,
        );

        //The conversation manifest has to be added
        const conversationManifestKey = await getConversationManifestKey(
            db,
            contactEnsName,
        );
        await db.keyValueStoreLocal.write(
            conversationManifestKey,
            INITIAL_CONVERSATION_MANIFEST(conversationManifestKey),
        );

        //If there is remote storage, we have to add the conversation list and the account manifest to it
        if (db.keyValueStoreRemote) {
            //Add the conversation list to the remote storage
            await db.keyValueStoreRemote.write(
                newConversationChunk.conversationList.key,
                newConversationChunk.conversationList,
            );

            // Increment the conversation list counter in the account manifest and add it to the remote storage
            await db.keyValueStoreRemote.write(
                newConversationChunk.accountManifest.key,
                newConversationChunk.accountManifest,
            );

            await db.keyValueStoreRemote.write(
                conversationManifestKey,
                INITIAL_CONVERSATION_MANIFEST(conversationManifestKey),
            );
        }
    };
}
function toggleHideConversationSideEffectContainment(
    db: Db,
): (contactEnsName: string, isHidden: boolean) => Promise<void> {
    return async (contactEnsName: string, isHidden: boolean) => {
        const conversationManifest = await getConversationManifest(
            contactEnsName,
            db,
        );

        if (!conversationManifest) {
            return;
        }
        await db.keyValueStoreLocal.write(conversationManifest.key, {
            ...conversationManifest,
            isHidden,
        });

        if (db.keyValueStoreRemote) {
            await db.keyValueStoreRemote.write(conversationManifest.key, {
                ...conversationManifest,
                isHidden,
            });
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
): (
    contactEnsName: string,
    envelop: StorageEnvelopContainer,
) => Promise<string> {
    return async (contactEnsName: string, envelop: StorageEnvelopContainer) => {
        //First we have to get the conversation manifest
        const conversationManifest = await getConversationManifest(
            contactEnsName,
            db,
        );
        if (!conversationManifest) {
            //The conversation manifest does not exist, so we have to create it
            await addConversationSideEffectContainment(db)(contactEnsName);
        }
        const messageChunkContainer = await addMessages(
            contactEnsName,
            [envelop],
            db,
        );

        await db.keyValueStoreLocal.write(
            messageChunkContainer.messageChunk.key,
            messageChunkContainer.messageChunk,
        );
        await db.keyValueStoreLocal.write(
            messageChunkContainer.conversationManifest.key,
            messageChunkContainer.conversationManifest,
        );

        //If there is remote storage, we have to add the message chunk and the conversation manifest to it
        if (db.keyValueStoreRemote) {
            await db.keyValueStoreRemote.write(
                messageChunkContainer.messageChunk.key,
                messageChunkContainer.messageChunk,
            );
            await db.keyValueStoreRemote.write(
                messageChunkContainer.conversationManifest.key,
                messageChunkContainer.conversationManifest,
            );
        }
        return messageChunkContainer.messageChunk.key;
    };
}
/**
 * This function creates a closure that, when invoked, adds a batch of new messages to a conversation
 * in the database and writes the message chunk and conversation manifest to local storage.
 * It contains all actions which have side effects.
 *
 * @param {Db} db - The database object to interact with.
 * @returns {(contactEnsName: string, envelop: Envelop) => Promise<void>} A function that takes a contactEnsName string
 *  and an Envelop object, and performs the operations.
 */
function addBatchMessageSideEffectContainment(
    db: Db,
): (
    contactEnsName: string,
    batch: StorageEnvelopContainer[],
) => Promise<string> {
    return async (contactEnsName: string, batch: StorageEnvelopContainer[]) => {
        //First we have to get the conversation manifest
        const conversationManifest = await getConversationManifest(
            contactEnsName,
            db,
        );
        if (!conversationManifest) {
            //The conversation manifest does not exist, so we have to create it
            await addConversationSideEffectContainment(db)(contactEnsName);
        }
        const messageChunkContainer = await addMessages(
            contactEnsName,
            batch,
            db,
        );

        await db.keyValueStoreLocal.write(
            messageChunkContainer.messageChunk.key,
            messageChunkContainer.messageChunk,
        );
        await db.keyValueStoreLocal.write(
            messageChunkContainer.conversationManifest.key,
            messageChunkContainer.conversationManifest,
        );

        //If there is remote storage, we have to add the message chunk and the conversation manifest to it
        if (db.keyValueStoreRemote) {
            await db.keyValueStoreRemote.write(
                messageChunkContainer.messageChunk.key,
                messageChunkContainer.messageChunk,
            );
            await db.keyValueStoreRemote.write(
                messageChunkContainer.conversationManifest.key,
                messageChunkContainer.conversationManifest,
            );
        }
        return messageChunkContainer.messageChunk.key;
    };
}

function editMessageBatchSideEffectContainment(
    db: Db,
): (contactEnsName: string, batch: StorageEnvelopContainer[]) => Promise<void> {
    return async (contactEnsName: string, batch: StorageEnvelopContainer[]) => {
        const updatedMessageChunks = await editMessages(
            contactEnsName,
            batch,
            db,
        );

        await Promise.all(
            updatedMessageChunks.map((chunk) =>
                db.keyValueStoreLocal.write(chunk.key, chunk),
            ),
        );

        //If there is remote storage, we have to add the message chunk and the conversation manifest to it
        if (db.keyValueStoreRemote) {
            await Promise.all(
                updatedMessageChunks.map((chunk) =>
                    db.keyValueStoreRemote!.write(chunk.key, chunk),
                ),
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
 * @param {KeyValueStore} options.keyValueStoreRemote - A remote key-value store. Use ${createRemoteKeyValueStoreApi} to create an instnace
 * @param {Encryption} options.encryption - An encryption object.
 *
 * @returns {StorageAPI} An API with methods for getting and adding conversations and messages.
 */

export function createStorage(
    accountEnsName: string,
    sign: (data: string) => Promise<string>,
    options?: Partial<{
        readStrategy: ReadStrategy;
        keyValueStoreRemote: KeyValueStore;
        encryption: Encryption;
    }>,
): StorageAPI {
    // If no Encryption object is provided, store the data as palintext
    const encryption = options?.encryption ?? {
        encrypt: (input: string) => Promise.resolve(input),
        decrypt: (input: string) => Promise.resolve(input),
    };
    const keyValueStoreLocal = createKeyValueStore(encryption);
    const db: Db = {
        readStrategy: ReadStrategy.LocalFirst,
        accountEnsName,
        keyValueStoreLocal,
        sign,
        // If we read from remote because a chunk is not available, we need to update local storage
        updateLocalStorageOnRemoteRead: async <T extends Chunk>(
            key: string,
            value: T,
        ) => {
            //If there is no remote storage, we do not need to update local storage
            if (!options?.keyValueStoreRemote) {
                return;
            }
            //when we read from remote, we need to update local storage
            await keyValueStoreLocal.write(key, value);
        },

        keyValueStoreRemote: options?.keyValueStoreRemote,
        ...options,
    };

    return {
        getMessages: async (contactEnsName: string, page: number) => {
            const chunk = await getMessageChunk(db, contactEnsName, page);
            // If the chunk is not available, return an empty array
            if (!chunk) {
                return [];
            }
            return chunk.envelopContainer;
        },

        getNumberOfMessages: (contactEnsName: string) =>
            getNumberOfMessages(contactEnsName, db),

        getConversationList: async (page: number) => {
            const chunk = await getConversationListChunk(db, page);
            // If the chunk is not available, return an empty array
            if (!chunk) {
                return [];
            }
            //For each contact name in the conversation list, we have to get the conversation manifest
            const manifests = await Promise.all(
                chunk.conversationList.map((c) =>
                    getConversationManifest(c, db),
                ),
            );

            const conversations = manifests
                .map((m, idx) => {
                    if (!m) {
                        //Should not happen since for each conversation in the list there is a manifest. But just in case we filter it out to be sure and satisfy the compiler
                        return undefined;
                    }
                    return {
                        ...m,
                        contactEnsName: chunk.conversationList[idx],
                    };
                })
                .filter((c): c is Conversation => c !== undefined);

            return conversations;
        },

        getNumberOfConverations: () => getNumberOfConverations(db),

        addConversation: addConversationSideEffectContainment(db),

        addMessage: addMessageSideEffectContainment(db),

        editMessageBatch: editMessageBatchSideEffectContainment(db),

        addMessageBatch: addBatchMessageSideEffectContainment(db),

        toggleHideConversation: toggleHideConversationSideEffectContainment(db),
    };
}
