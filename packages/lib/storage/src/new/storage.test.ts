import { stringify } from '@dm3-org/dm3-lib-shared';
import { createStorage } from './index';
import { makeEnvelop } from './testHelper';
import { Chunk, Encryption, ReadStrategy, StorageAPI } from './types';
import { MessageState } from '@dm3-org/dm3-lib-messaging';

describe('createStorage Integration Tests', () => {
    let storageApi: StorageAPI;
    let remoteKeyValueStore: any;

    describe('Remote first', () => {
        const mockSign = (s: string) => Promise.resolve('signature');
        beforeEach(() => {
            // Setup mock sign function

            // Setup mock remote key-value store
            const getRemoteKeyValueStore = () => {
                const s = new Map<string, string>();
                return {
                    read: async (key: string): Promise<Chunk | undefined> => {
                        const res = await s.get(key);
                        if (!res) {
                            return undefined;
                        }
                        return JSON.parse(res) as Chunk;
                    },
                    write: async (key: string, value: Chunk): Promise<void> => {
                        await s.set(key, stringify(value));
                    },
                    s,
                };
            };

            remoteKeyValueStore = getRemoteKeyValueStore();

            // Create the storage API with mocks
            storageApi = createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.LocalFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
        });
        it('addConversation - increase the conversation counter', async () => {
            await storageApi.addConversation('bob.eth');

            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
            const count = await storageApi.getNumberOfConverations();
            expect(count).toBe(1);
        });
        it('addConversation - conversationList should include the previously added conversation', async () => {
            await storageApi.addConversation('bob.eth');
            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
            const conversations = await storageApi.getConversationList(0);

            expect(conversations.length).toBe(1);

            expect(conversations[0].contactEnsName).toBe('bob.eth');
            expect(conversations[0].isHidden).toBe(false);
            expect(conversations[0].messageCounter).toBe(0);
        });
        it('addConversation - conversationList should not contain duplicates', async () => {
            await storageApi.addConversation('bob.eth');
            await storageApi.addConversation('max.eth');
            await storageApi.addConversation('bob.eth');
            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
            const conversations = await storageApi.getConversationList(0);

            expect(conversations.length).toBe(2);

            expect(conversations[0].contactEnsName).toBe('bob.eth');
            expect(conversations[0].isHidden).toBe(false);
            expect(conversations[0].messageCounter).toBe(0);

            expect(conversations[1].contactEnsName).toBe('max.eth');
            expect(conversations[1].isHidden).toBe(false);
            expect(conversations[1].messageCounter).toBe(0);
        });
        it('add new message - stores new message', async () => {
            await storageApi.addConversation('bob.eth');
            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
            const envelop = makeEnvelop(
                'alice.eth',
                'bob.eth',
                'Hello Bob',
                1706084571962,
            );

            const storageEnvelopContainer = {
                envelop,
                messageState: MessageState.Created,
            };
            await storageApi.addMessage('bob.eth', storageEnvelopContainer);
            const messageChunk = await storageApi.getMessages('bob.eth', 0);
            expect(messageChunk.length).toBe(1);
            expect(messageChunk[0]).toEqual(storageEnvelopContainer);
        });
        it('add message batch - stores message batch', async () => {
            await storageApi.addConversation('bob.eth');
            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
            const envelop = makeEnvelop(
                'alice.eth',
                'bob.eth',
                'Hello Bob',
                1706084571962,
            );
            const envelop2 = makeEnvelop(
                'alice.eth',
                'bob.eth',
                'XYZ',
                1706084571962,
            );
            const envelop3 = makeEnvelop(
                'alice.eth',
                'bob.eth',
                'blablabla',
                1706084571962,
            );

            await storageApi.addMessageBatch('bob.eth', [
                {
                    envelop,
                    messageState: MessageState.Created,
                },
                {
                    envelop: envelop2,
                    messageState: MessageState.Created,
                },
                {
                    envelop: envelop3,
                    messageState: MessageState.Created,
                },
            ]);

            const messageChunk = await storageApi.getMessages('bob.eth', 0);
            expect(messageChunk.length).toBe(3);
            expect(messageChunk[0].envelop).toEqual(envelop);
            expect(messageChunk[1].envelop).toEqual(envelop2);
            expect(messageChunk[2].envelop).toEqual(envelop3);
        });

        it('add new message - updates number of messages', async () => {
            await storageApi.addConversation('bob.eth');
            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
            let messageCounter = await storageApi.getNumberOfMessages(
                'bob.eth',
            );
            expect(messageCounter).toBe(0);
            const envelop = makeEnvelop(
                'alice.eth',
                'bob.eth',
                'Hello Bob',
                1706084571962,
            );

            const storageEnvelopContainer = {
                envelop,
                messageState: MessageState.Created,
            };

            await storageApi.addMessage('bob.eth', storageEnvelopContainer);
            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
            messageCounter = await storageApi.getNumberOfMessages('bob.eth');
            expect(messageCounter).toBe(1);

            await storageApi.addMessage('bob.eth', storageEnvelopContainer);
            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
            messageCounter = await storageApi.getNumberOfMessages('bob.eth');
            expect(messageCounter).toBe(2);

            await storageApi.addMessage('bob.eth', storageEnvelopContainer);
            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
            messageCounter = await storageApi.getNumberOfMessages('bob.eth');
            expect(messageCounter).toBe(3);

            const messages = await storageApi.getMessages('bob.eth', 0);
            expect(messages.length).toBe(3);

            expect(messages[0]).toEqual(storageEnvelopContainer);
            expect(messages[1]).toEqual(storageEnvelopContainer);
            expect(messages[2]).toEqual(storageEnvelopContainer);
        });
        it('getMessages -- return [] if no converation exists', async () => {
            const messages = await storageApi.getMessages('bob.eth', 0);
            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
            expect(messages.length).toBe(0);
        });
        it('getNumberOfMessages -- return 0 if no converation exists', async () => {
            const count = await storageApi.getNumberOfMessages('bob.eth');
            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
            expect(count).toBe(0);
        });

        it('getConversationList -- return [] if no converation exists', async () => {
            const list = await storageApi.getConversationList(0);
            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
            expect(list!.length).toBe(0);
            expect(list).toEqual([]);
        });
        it('getNumberOfConversations -- return 0 if no converation exists', async () => {
            const count = await storageApi.getNumberOfConverations();
            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
            expect(count).toBe(0);
        });
        it('getNumberOfConversations -- return 0 if no converation exists', async () => {
            const count = await storageApi.getNumberOfConverations();
            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
            expect(count).toBe(0);
        });
        it('add Message -- adds conversation if it has not been added before', async () => {
            const envelop = makeEnvelop(
                'alice.eth',
                'bob.eth',
                'Hello Bob',
                1706084571962,
            );

            const storageEnvelopContainer = {
                envelop,
                messageState: MessageState.Created,
            };

            await storageApi.addMessage('bob.eth', storageEnvelopContainer);
            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });

            const conversations = await storageApi.getConversationList(0);
            expect(conversations.length).toBe(1);
            expect(conversations[0].contactEnsName).toBe('bob.eth');
            expect(conversations[0].isHidden).toBe(false);
            expect(conversations[0].messageCounter).toBe(1);

            const getMessages = await storageApi.getMessages('bob.eth', 0);
            expect(getMessages.length).toBe(1);
            expect(getMessages[0]).toEqual(storageEnvelopContainer);
        });
        it('hide conversation -- conversation can be hidden', async () => {
            await storageApi.addConversation('bob.eth');
            await storageApi.addConversation('max.eth');
            await storageApi.toggleHideConversation('max.eth', true);
            //We acreate an newStorageApi to verify that the data is stored in remote storage and not just locally
            storageApi = await createStorage('alice.eth', mockSign, {
                readStrategy: ReadStrategy.RemoteFirst,
                keyValueStoreRemote: remoteKeyValueStore,
            });
            const conversations = await storageApi.getConversationList(0);

            expect(conversations.length).toBe(2);
            expect(conversations[0].isHidden).toBe(false);
            expect(conversations[1].isHidden).toBe(true);

            //Can unhide conversation aswell
            await storageApi.toggleHideConversation('max.eth', false);
            const conversations2 = await storageApi.getConversationList(0);

            expect(conversations2.length).toBe(2);
            expect(conversations2[0].isHidden).toBe(false);
            expect(conversations2[1].isHidden).toBe(false);
        });
    });

    describe('Local first', () => {
        const mockSign = (s: string) => Promise.resolve('signature');
        beforeEach(() => {
            // Setup mock sign function
            storageApi = createStorage('alice.eth', mockSign);
        });
        it('addConversation - storage is not persistant', async () => {
            await storageApi.addConversation('bob.eth');
            let count = await storageApi.getNumberOfConverations();
            expect(count).toBe(1);
            storageApi = createStorage('alice.eth', mockSign);
            count = await storageApi.getNumberOfConverations();
            expect(count).toBe(0);
        });
        it('addConversation - increase the conversation counter', async () => {
            await storageApi.addConversation('bob.eth');
            const count = await storageApi.getNumberOfConverations();
            expect(count).toBe(1);
        });
        it('addConversation - conversationList should include the previously added conversation', async () => {
            await storageApi.addConversation('bob.eth');
            const conversations = await storageApi.getConversationList(0);

            expect(conversations.length).toBe(1);
            expect(conversations.length).toBe(1);
            expect(conversations[0].contactEnsName).toBe('bob.eth');
            expect(conversations[0].isHidden).toBe(false);
            expect(conversations[0].messageCounter).toBe(0);
        });
        it('add new message - stores new message', async () => {
            await storageApi.addConversation('bob.eth');
            const envelop = makeEnvelop(
                'alice.eth',
                'bob.eth',
                'Hello Bob',
                1706084571962,
            );

            const storageEnvelopContainer = {
                envelop,
                messageState: MessageState.Created,
            };

            await storageApi.addMessage('bob.eth', storageEnvelopContainer);
            const messageChunk = await storageApi.getMessages('bob.eth', 0);
            expect(messageChunk.length).toBe(1);
            expect(messageChunk[0]).toEqual(storageEnvelopContainer);
        });
        it('add new message - updates number of messages', async () => {
            await storageApi.addConversation('bob.eth');
            let messageCounter = await storageApi.getNumberOfMessages(
                'bob.eth',
            );
            expect(messageCounter).toBe(0);
            const envelop = makeEnvelop(
                'alice.eth',
                'bob.eth',
                'Hello Bob',
                1706084571962,
            );
            const storageEnvelopContainer = {
                envelop,
                messageState: MessageState.Created,
            };

            await storageApi.addMessage('bob.eth', storageEnvelopContainer);
            messageCounter = await storageApi.getNumberOfMessages('bob.eth');
            expect(messageCounter).toBe(1);

            await storageApi.addMessage('bob.eth', storageEnvelopContainer);
            messageCounter = await storageApi.getNumberOfMessages('bob.eth');
            expect(messageCounter).toBe(2);

            await storageApi.addMessage('bob.eth', storageEnvelopContainer);
            messageCounter = await storageApi.getNumberOfMessages('bob.eth');
            expect(messageCounter).toBe(3);

            const messages = await storageApi.getMessages('bob.eth', 0);
            expect(messages.length).toBe(3);

            expect(messages[0]).toEqual(storageEnvelopContainer);
            expect(messages[1]).toEqual(storageEnvelopContainer);
            expect(messages[2]).toEqual(storageEnvelopContainer);
        });
        it('getMessages -- return [] if no converation exists', async () => {
            const messages = await storageApi.getMessages('bob.eth', 0);
            expect(messages.length).toBe(0);
        });
        it('getNumberOfMessages -- return 0 if no converation exists', async () => {
            const count = await storageApi.getNumberOfMessages('bob.eth');
            expect(count).toBe(0);
        });

        it('getConversationList -- return [] if no converation exists', async () => {
            const list = await storageApi.getConversationList(0);
            expect(list!.length).toBe(0);
            expect(list).toEqual([]);
        });
        it('getNumberOfConversations -- return 0 if no converation exists', async () => {
            const count = await storageApi.getNumberOfConverations();
            expect(count).toBe(0);
        });
        it('getNumberOfConversations -- return 0 if no converation exists', async () => {
            const count = await storageApi.getNumberOfConverations();
            expect(count).toBe(0);
        });
        it('add Message -- adds conversation if it has not been added before', async () => {
            const envelop = makeEnvelop(
                'alice.eth',
                'bob.eth',
                'Hello Bob',
                1706084571962,
            );

            const storageEnvelopContainer = {
                envelop,
                messageState: MessageState.Created,
            };

            await storageApi.addMessage('bob.eth', storageEnvelopContainer);

            const conversations = await storageApi.getConversationList(0);
            expect(conversations.length).toBe(1);
            expect(conversations[0].contactEnsName).toBe('bob.eth');
            expect(conversations[0].isHidden).toBe(false);
            expect(conversations[0].messageCounter).toBe(1);

            const getMessages = await storageApi.getMessages('bob.eth', 0);
            expect(getMessages.length).toBe(1);
            expect(getMessages[0]).toEqual(storageEnvelopContainer);
        });
        it('hide conversation -- conversation can be hidden', async () => {
            await storageApi.addConversation('bob.eth');
            await storageApi.addConversation('max.eth');
            await storageApi.toggleHideConversation('max.eth', true);

            const conversations = await storageApi.getConversationList(0);

            expect(conversations.length).toBe(2);
            expect(conversations[0].isHidden).toBe(false);
            expect(conversations[1].isHidden).toBe(true);

            //Can unhide conversation aswell
            await storageApi.toggleHideConversation('max.eth', false);
            const conversations2 = await storageApi.getConversationList(0);

            expect(conversations2.length).toBe(2);
            expect(conversations2[0].isHidden).toBe(false);
            expect(conversations2[1].isHidden).toBe(false);
        });
    });
});
