/* eslint-disable no-console */
import { stringify } from '@dm3-org/dm3-lib-shared';
import { createStorage } from './index';
import { makeEnvelop } from './testHelper';
import { Chunk, Encryption, StorageAPI } from './types';

describe('createStorage Integration Tests', () => {
    let storageApi: StorageAPI;
    let mockEncryption: Encryption;
    let inMemoryKeyValueRemote: any;

    beforeEach(() => {
        // Setup mock sign function
        const mockSign = (s: string) => Promise.resolve('signature');

        // Setup mock encryption object
        mockEncryption = {
            encrypt: (s: string) => Promise.resolve(s),
            decrypt: (s: string) => Promise.resolve(s),
        };

        // Setup mock remote key-value store
        inMemoryKeyValueRemote = () => {
            const s = new Map<string, string>();
            return {
                read: async (key: string): Promise<Chunk | undefined> => {
                    console.log('read', key);
                    const res = await s.get(key);
                    if (!res) {
                        return undefined;
                    }
                    return JSON.parse(res) as Chunk;
                },
                write: async (key: string, value: Chunk): Promise<void> => {
                    console.log('write', key, value);
                    await s.set(key, stringify(value));
                },
                s,
            };
        };

        // Create the storage API with mocks
        storageApi = createStorage('alice.eth', mockSign, {
            // readStrategy: ReadStrategy.LocalFirst,
            // encryption: mockEncryption,
            //@ts-ignore
            // keyValueStoreRemote: inMemoryKeyValueRemote(),
            // remoteStorageUrl: 'http://remote-storage.test',
        });
    });

    describe('Local first ', () => {
        it('addConversation - increase the conversation counter', async () => {
            await storageApi.addConversation('bob.eth');
            const count = await storageApi.getNumberOfConverations();
            expect(count).toBe(1);
        });
        it('addConversation - conversationList should include the previously added conversation', async () => {
            await storageApi.addConversation('bob.eth');
            const list = await storageApi.getConversationList(0);

            expect(list?.conversationList.length).toBe(1);
            expect(list?.conversationList[0]).toBe('bob.eth');
        });
        it('add new message - stores new message', async () => {
            await storageApi.addConversation('bob.eth');
            const envelop = makeEnvelop(
                'alice.eth',
                'bob.eth',
                'Hello Bob',
                1706084571962,
            );
            await storageApi.addMessage('bob.eth', envelop);
            const messageChunk = await storageApi.getMessages('bob.eth', 0);
            expect(messageChunk?.envelops.length).toBe(1);
            expect(messageChunk?.envelops[0]).toEqual(envelop);
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

            await storageApi.addMessage('bob.eth', envelop);
            messageCounter = await storageApi.getNumberOfMessages('bob.eth');
            expect(messageCounter).toBe(1);

            await storageApi.addMessage('bob.eth', envelop);
            messageCounter = await storageApi.getNumberOfMessages('bob.eth');
            expect(messageCounter).toBe(2);

            await storageApi.addMessage('bob.eth', envelop);
            messageCounter = await storageApi.getNumberOfMessages('bob.eth');
            expect(messageCounter).toBe(3);

            const messages = await storageApi.getMessages('bob.eth', 0);
            expect(messages?.envelops.length).toBe(3);

            expect(messages?.envelops[0]).toEqual(envelop);
            expect(messages?.envelops[1]).toEqual(envelop);
            expect(messages?.envelops[2]).toEqual(envelop);
        });
    });

    // it('addMessage should write to local and remote storage', async () => {
    //     const message: Message = {
    //         from: 'from_address',
    //         to: 'to_address',
    //         timestamp: 123456789,
    //         content: 'message_content',
    //     };
    //     const envelop = testData.envelopA;

    //     await storageApi.addMessage('contact_name', envelop);

    //     // Verify local write
    //     expect(mockKeyValueStoreRemote.write).toHaveBeenCalledWith(
    //         expect.any(String),
    //         expect.objectContaining({
    //             id: expect.any(String),
    //             from: expect.any(String),
    //             to: expect.any(String),
    //             timestamp: expect.any(Number),
    //             content: expect.any(String),
    //             // ... match other properties as needed
    //         }),
    //     );

    //     // Verify remote write if ReadStrategy is RemoteFirst
    //     expect(mockKeyValueStoreRemote.write).toHaveBeenCalledTimes(2);
    // });

    // Additional tests can be written to cover other methods and scenarios
});
