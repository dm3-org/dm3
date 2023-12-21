import { Envelop } from 'dm3-lib-messaging';
import {
    MAX_CONVERATION_ENTRIES_PER_CHUNK,
    MAX_MESSAGE_SIZE,
} from './constants';
import { getConversationListKey, getMessageChunkKey } from './keys';
import {
    getAccountManifest,
    getConversationListChunk,
    getConversationManifest,
    getMessageChunk,
} from './read';
import {
    AccountManifest,
    ConversationList,
    ConversationManifest,
    Db,
    MessageChunk,
} from './types';
import { getSize } from 'dm3-lib-shared';

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

    return {
        conversationList: {
            key,
            conversationList: conversationListChunk
                ? [...conversationListChunk.conversationList, contactEnsName]
                : [contactEnsName],
        },
        accountManifest: {
            ...accountMainfest,
            conversationListCounter:
                accountMainfest.conversationListCounter + 1,
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
export async function addMessage(
    contactEnsName: string,
    envelop: Envelop,
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
    if (getSize(envelop) > MAX_MESSAGE_SIZE) {
        throw Error(`Message size is too big`);
    }
    // get the conversation manifest and calculate the target chunk index based on the current message counter.
    const conversationManifest = await getConversationManifest(
        contactEnsName,
        db,
    );

    const targetChunkIndex = Math.floor(
        conversationManifest.messageCounter / MAX_CONVERATION_ENTRIES_PER_CHUNK,
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

            envelops: messageChunk
                ? [...messageChunk.envelops, envelop]
                : [envelop],
        },
        conversationManifest: {
            ...conversationManifest,
            messageCounter: conversationManifest.messageCounter + 1,
        },
    };
}
