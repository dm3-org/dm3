/* eslint-disable max-len */
import { Envelop } from '@dm3-org/dm3-lib-messaging';
import { getSize } from '@dm3-org/dm3-lib-shared';
import {
    MAX_CONVERATION_ENTRIES_PER_CHUNK,
    MAX_MESSAGES_PER_CHUNK,
    MAX_MESSAGE_SIZE,
} from './constants';
import { getConversationListKey, getMessageChunkKey } from './keys';
import {
    getAccountManifest,
    getConversationListChunk,
    getConversationManifest,
    getMessageChunk,
    getMessageChunkByKey,
} from './read';
import {
    AccountManifest,
    ConversationList,
    ConversationManifest,
    Db,
    MessageChunk,
    StorageEnvelopContainer,
} from './types';

/**
 * This function adds a new conversation to the conversation list.
 * It will not directly write to the storage, but instead return the updated conversation list and account manifest.
 *
 * @param {string} contactEnsName - The ENS name of the contact.
 * @param {Db} db - The database object, which contains the account's ENS name and the sign function.
 * @returns {Promise<{conversationList: ConversationList, accountManifest: AccountManifest}>}
 *  A promise that resolves to an object containing the updated conversation list and account manifest.
 */
export async function addConversation(
    contactEnsName: string,
    db: Db,
): Promise<{
    conversationList: ConversationList;
    accountManifest: AccountManifest;
}> {
    // get the account manifest and calculate the target chunk index based on the current conversation list counter.
    const accountMainfest = await getAccountManifest(db);
    const targetChunkIndex = Math.floor(
        accountMainfest.conversationListCounter /
            MAX_CONVERATION_ENTRIES_PER_CHUNK,
    );

    // get the conversation list chunk at the target chunk index.
    const conversationListChunk = await getConversationListChunk(
        db,
        targetChunkIndex,
    );

    // calculate the key for the conversation list chunk and creates a new conversation list
    // with the new conversation added
    const key = await getConversationListKey(db, targetChunkIndex);

    const conversationIsAlreadyInList =
        conversationListChunk &&
        conversationListChunk.conversationList.includes(contactEnsName);

    const conversationList = !conversationListChunk
        ? //If the conversation list chunk does not exist, we have to create it and add the conversation as the first element
          [contactEnsName]
        : //If the conversation list chunk exists, we have to check if the conversation has been already added. If so we can just return the conversation list chunk as it is.
        conversationIsAlreadyInList
        ? [...conversationListChunk.conversationList]
        : //If the conversation has not been added yet, we have to add it to the conversation list chunk
          [...conversationListChunk.conversationList, contactEnsName];

    return {
        conversationList: {
            key,
            conversationList,
        },
        accountManifest: {
            ...accountMainfest,
            conversationListCounter: conversationListChunk
                ? accountMainfest.conversationListCounter
                : accountMainfest.conversationListCounter + 1,
        },
    };
}

/**
 * This function adds a new message to a conversation.
 * It will not directly write to the storage, but instead return the updated message chunk and conversation manifest.
 *
 * @param {string} contactEnsName - The ENS name of the contact.
 * @param {Envelop} envelop - The envelop containing the message.
 * @param {Db} db - The database object, which contains the account's ENS name and the sign function.
 * @returns {Promise<{messageChunk: MessageChunk, conversationManifest: ConversationManifest}>}
 *  A promise that resolves to an object containing the updated message chunk and conversation manifest.
 * @throws {Error} If the message size is too big.
 */
export async function addMessages(
    contactEnsName: string,
    storageEnvelopContainer: StorageEnvelopContainer[],
    db: Db,
): Promise<{
    messageChunk: MessageChunk;
    conversationManifest: ConversationManifest;
}> {
    // Check if the message size is too big
    // Normally the getEnvelopSize function should be used for message size calculation.
    // However, the getEnvelopSize function exepects an encrypted envelop as input.
    // In the case of the storage we encrypt the whole chunk and not a single message.
    // Therefore we use the getSize function on an unencrypted envelop.
    storageEnvelopContainer.forEach((envelopContainer) => {
        if (getSize(envelopContainer.envelop) > MAX_MESSAGE_SIZE) {
            throw Error(`Message size is too big`);
        }
    });
    // get the conversation manifest and calculate the target chunk index based on the current message counter.
    const conversationManifest = await getConversationManifest(
        contactEnsName,
        db,
    );

    if (!conversationManifest) {
        //We have to create the convesation manifest first brefore we can add the message
        //This should have done before calling addMessage
        throw Error(`Conversation manifest does not exist`);
    }

    const targetChunkIndex = Math.floor(
        conversationManifest.messageCounter / MAX_MESSAGES_PER_CHUNK,
    );

    // get the message chunk at the target chunk index.
    const messageChunk = await getMessageChunk(
        db,
        contactEnsName,
        targetChunkIndex,
    );

    // calculate the key for the message chunk and creates a new message chunk with the new message added
    const key = await getMessageChunkKey(db, contactEnsName, targetChunkIndex);

    return {
        messageChunk: {
            key,
            envelopContainer: messageChunk
                ? [...messageChunk.envelopContainer, ...storageEnvelopContainer]
                : [...storageEnvelopContainer],
        },
        conversationManifest: {
            ...conversationManifest,
            messageCounter:
                conversationManifest.messageCounter +
                storageEnvelopContainer.length,
        },
    };
}
export async function editMessage(
    contactEnsName: string,
    storageEnvelopContainer: StorageEnvelopContainer[],
    db: Db,
): Promise<MessageChunk[]> {
    const conversationManifest = await getConversationManifest(
        contactEnsName,
        db,
    );

    if (!conversationManifest) {
        //We have to create the convesation manifest first brefore we can add the message
        //This should have done before calling addMessage
        throw Error(`Conversation manifest does not exist`);
    }

    const updatedChunkSet: { [messageChunkKey: string]: MessageChunk } = {};

    for (const envelopContainer of storageEnvelopContainer) {
        let currentChunk = updatedChunkSet[envelopContainer.messageChunkKey];

        if (!currentChunk) {
            const chunkFromStorage = await getMessageChunkByKey(
                db,
                envelopContainer.messageChunkKey,
            );

            if (!chunkFromStorage) {
                throw Error(`Message chunk does not exist`);
            }
            currentChunk = chunkFromStorage;
        }

        const updatedEnvelops = currentChunk.envelopContainer.map(
            (storedEnvelop) => {
                //Find the message we wan't to edit
                if (
                    storedEnvelop.envelop.postmark?.messageHash ===
                    envelopContainer.envelop.postmark?.messageHash
                ) {
                    return envelopContainer;
                }
                return storedEnvelop;
            },
        );

        updatedChunkSet[envelopContainer.messageChunkKey] = {
            key: currentChunk.key,
            envelopContainer: updatedEnvelops,
        };
    }

    return Object.values(updatedChunkSet);
}
