import { db, testEnvelop } from './testHelper';
import {
    getAccountManifest,
    getConversationListChunk,
    getConversationManifest,
    getMessageChunk,
    getNumberOfConverations,
    getNumberOfMessages,
} from './read';
import {
    getAccountManifestKey,
    getConversationListKey,
    getConversationManifestKey,
    getMessageChunkKey,
} from './keys';

describe('read', () => {
    describe('getMessageChunk', () => {
        it('should get a message chunk', async () => {
            expect(await getMessageChunk(db, 'alice.eth', 1)).toEqual({
                key: await getMessageChunkKey(db, 'alice.eth', 1),
                envelops: [testEnvelop],
            });
        });
    });

    describe('getConversationListChunk', () => {
        it('should get a conversation list chunk', async () => {
            expect(await getConversationListChunk(db, 1)).toEqual({
                key: await getConversationListKey(db, 1),
                conversationList: ['c1'],
            });
        });
    });

    describe('getNumberOfMessages', () => {
        it('should get the correct number of messages', async () => {
            expect(await getNumberOfMessages('alice.eth', db)).toEqual(101);
        });
    });

    describe('getConversationManifest', () => {
        it('should get the correct conversation manifest', async () => {
            expect(await getConversationManifest('alice.eth', db)).toEqual({
                key: await getConversationManifestKey(db, 'alice.eth'),
                messageCounter: 101,
            });
        });
    });

    describe('getAccountManifest', () => {
        it('should get the correct account manifest', async () => {
            expect(await getAccountManifest(db)).toEqual({
                conversationListCounter: 101,
                key: await getAccountManifestKey(db),
            });
        });
    });

    describe('getNumberOfConverations', () => {
        it('should get the correct number of conversations', async () => {
            expect(await getNumberOfConverations(db)).toEqual(101);
        });
    });
});
