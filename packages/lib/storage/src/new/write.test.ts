import { addConversation, addMessage } from './write';
import { db, makeEnvelop, testEnvelop } from './testHelper';

import {
    getAccountManifestKey,
    getConversationListKey,
    getConversationManifestKey,
    getMessageChunkKey,
} from './keys';

describe('write', () => {
    describe('addConversation', () => {
        it('should add a conversation to the database', async () => {
            const contactEnsName = 'c2';

            expect(await addConversation(contactEnsName, db)).toEqual({
                conversationList: {
                    key: await getConversationListKey(db, 1),
                    conversationList: ['c1', 'c2'],
                },
                accountManifest: {
                    conversationListCounter: 102,
                    key: await getAccountManifestKey(db),
                },
            });
        });
    });
    describe('addMessageChunk', () => {
        it('should add a message to the database', async () => {
            const envelop = makeEnvelop('from2', 'to2', 'message', Date.now());

            expect(await addMessage('alice.eth', envelop, db)).toEqual({
                messageChunk: {
                    key: await getMessageChunkKey(db, 'alice.eth', 1),
                    envelops: [testEnvelop, envelop],
                },
                conversationManifest: {
                    key: await getConversationManifestKey(db, 'alice.eth'),
                    messageCounter: 102,
                },
            });
        });
    });
});
