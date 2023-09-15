import { Envelop, Message } from 'dm3-lib-messaging';
import { MessageStorage } from './MessageStorage';
import { sha256 } from 'dm3-lib-shared';
import { decrypt, encrypt } from 'dm3-lib-crypto';

describe('MessageStorage', () => {
    describe('Tree', () => {
        it('creates empty root if not present in the database', async () => {
            const db = testDb();
            const rootKey = sha256('alice.eth');
            const enc = {
                encrypt: (val: any) => val,
                decrypt: (val: any) => val,
            };
            const storage = await MessageStorage(
                {
                    getNode: db.getNode,
                    addNode: db.addNode,
                },
                enc,
                rootKey,
            );
            expect(db.nodes.size).toBe(1);
            expect(db.nodes.get(rootKey)).toEqual(JSON.stringify([]));
            expect(storage.getConversations()).toEqual([]);
        });
        it('first message, creates new conversation, and chunk', async () => {
            const keyB = '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=';

            const db = testDb();
            const rootKey = sha256('alice.eth');

            const enc = {
                //encrypt: (val: any) => val,
                encrypt: (val: any) => encrypt(keyB, val),
                //decrypt: (val: any) => val,
                decrypt: (val: any) => decrypt(keyB, val),
            };
            const storage = await MessageStorage(
                {
                    getNode: db.getNode,
                    addNode: db.addNode,
                },
                enc,
                rootKey,
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello', 123),
            );
            const conversations = storage.getConversations();
            expect(conversations).toEqual(['bob.eth']);

            const conversationNode = storage._tree.getLeafs<any>()[0];
            expect(conversationNode.key).toBe(sha256(rootKey + 'bob.eth'));
            expect(storage._tree.key).toBe(rootKey);

            expect(conversationNode.getLeafs().length).toBe(1);
            const chunkNode = conversationNode.getLeafs()[0];
            expect(chunkNode.key).toBe(
                sha256(
                    conversationNode.key +
                        JSON.stringify({
                            id: 0,
                            timestamp: 123,
                        }),
                ),
            );
            expect(chunkNode.getLeafs().length).toBe(1);
            const envelop = chunkNode.getLeafs()[0];
            expect(envelop).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello', 123),
            );
        });
        it('multiple messages, add messages to the same chunk', async () => {
            const keyB = '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=';

            const db = testDb();
            const rootKey = sha256('alice.eth');

            const enc = {
                //encrypt: (val: any) => val,
                encrypt: (val: any) => encrypt(keyB, val),
                //decrypt: (val: any) => val,
                decrypt: (val: any) => decrypt(keyB, val),
            };
            const storage = await MessageStorage(
                {
                    getNode: db.getNode,
                    addNode: db.addNode,
                },
                enc,
                rootKey,
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello2', 124),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello3', 125),
            );
            const conversations = storage.getConversations();
            expect(conversations).toEqual(['bob.eth']);

            const conversationNode = storage._tree.getLeafs<any>()[0];

            expect(conversationNode.getLeafs().length).toBe(1);
            const chunkNode = conversationNode.getLeafs()[0];

            expect(chunkNode.getLeafs().length).toBe(3);
            expect(chunkNode.getLeafs()[0]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
            );
            expect(chunkNode.getLeafs()[1]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello2', 124),
            );
            expect(chunkNode.getLeafs()[2]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello3', 125),
            );
        });
        it('multiple messages, add new chunk if chunk if full', async () => {
            const keyB = '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=';

            const db = testDb();
            const rootKey = sha256('alice.eth');

            const enc = {
                //encrypt: (val: any) => val,
                encrypt: (val: any) => encrypt(keyB, val),
                //decrypt: (val: any) => val,
                decrypt: (val: any) => decrypt(keyB, val),
            };
            const storage = await MessageStorage(
                {
                    getNode: db.getNode,
                    addNode: db.addNode,
                },
                enc,
                rootKey,
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello2', 124),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello3', 125),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
            );
            const conversations = storage.getConversations();
            expect(conversations).toEqual(['bob.eth']);

            const conversationNode = storage._tree.getLeafs<any>()[0];

            expect(conversationNode.getLeafs().length).toBe(2);
            const chunkNode1 = conversationNode.getLeafs()[0];

            expect(chunkNode1.getLeafs().length).toBe(3);
            expect(chunkNode1.getLeafs()[0]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
            );
            expect(chunkNode1.getLeafs()[1]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello2', 124),
            );
            expect(chunkNode1.getLeafs()[2]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello3', 125),
            );

            const chunkNode2 = conversationNode.getLeafs()[1];
            expect(chunkNode2.getLeafs().length).toBe(1);
            expect(chunkNode2.getLeafs()[0]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
            );
        });
        it('multiple conversations, add messages to the corrospending chunk', async () => {
            const keyB = '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=';

            const db = testDb();
            const rootKey = sha256('alice.eth');

            const enc = {
                //encrypt: (val: any) => val,
                encrypt: (val: any) => encrypt(keyB, val),
                //decrypt: (val: any) => val,
                decrypt: (val: any) => decrypt(keyB, val),
            };
            const storage = await MessageStorage(
                {
                    getNode: db.getNode,
                    addNode: db.addNode,
                },
                enc,
                rootKey,
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello3', 125),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello5', 127),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
            );
            const conversations = storage.getConversations();
            expect(conversations).toEqual(['bob.eth', 'vitalik.eth']);

            const [conversationBob, conversationVitalik] =
                storage._tree.getLeafs<any>();

            expect(conversationBob.getLeafs().length).toBe(1);
            expect(conversationVitalik.getLeafs().length).toBe(1);
            const chunkNode1 = conversationBob.getLeafs()[0];
            const chunkNode2 = conversationVitalik.getLeafs()[0];

            expect(chunkNode1.getLeafs().length).toBe(3);
            expect(chunkNode2.getLeafs().length).toBe(3);

            expect(chunkNode1.getLeafs()[0]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
            );
            expect(chunkNode1.getLeafs()[1]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
            );
            expect(chunkNode1.getLeafs()[2]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
            );

            expect(chunkNode2.getLeafs()[0]).toEqual(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
            );
            expect(chunkNode2.getLeafs()[1]).toEqual(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello3', 125),
            );
            expect(chunkNode2.getLeafs()[2]).toEqual(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello5', 127),
            );
        });
        it('multiple conversations, add messages to the corrospending chunk', async () => {
            const keyB = '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=';

            const db = testDb();
            const rootKey = sha256('alice.eth');

            const enc = {
                //encrypt: (val: any) => val,
                encrypt: (val: any) => encrypt(keyB, val),
                //decrypt: (val: any) => val,
                decrypt: (val: any) => decrypt(keyB, val),
            };
            const storage = await MessageStorage(
                {
                    getNode: db.getNode,
                    addNode: db.addNode,
                },
                enc,
                rootKey,
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello3', 125),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello5', 127),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
            );
            const conversations = storage.getConversations();
            expect(conversations).toEqual(['bob.eth', 'vitalik.eth']);

            const [conversationBob, conversationVitalik] =
                storage._tree.getLeafs<any>();

            expect(conversationBob.getLeafs().length).toBe(1);
            expect(conversationVitalik.getLeafs().length).toBe(1);
            const chunkNode1 = conversationBob.getLeafs()[0];
            const chunkNode2 = conversationVitalik.getLeafs()[0];

            expect(chunkNode1.getLeafs().length).toBe(3);
            expect(chunkNode2.getLeafs().length).toBe(3);

            expect(chunkNode1.getLeafs()[0]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
            );
            expect(chunkNode1.getLeafs()[1]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
            );
            expect(chunkNode1.getLeafs()[2]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
            );

            expect(chunkNode2.getLeafs()[0]).toEqual(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
            );
            expect(chunkNode2.getLeafs()[1]).toEqual(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello3', 125),
            );
            expect(chunkNode2.getLeafs()[2]).toEqual(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello5', 127),
            );
        });
        it('multiple conversations, use existing root', async () => {
            const keyB = '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=';

            const db = testDb();
            const rootKey = sha256('alice.eth');

            const enc = {
                //encrypt: (val: any) => val,
                encrypt: (val: any) => encrypt(keyB, val),
                //decrypt: (val: any) => val,
                decrypt: (val: any) => decrypt(keyB, val),
            };
            const storage = await MessageStorage(
                {
                    getNode: db.getNode,
                    addNode: db.addNode,
                },
                enc,
                rootKey,
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello3', 125),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello5', 127),
            );
            await storage.addMessage(
                makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
            );

            //Initialize stoage object again to see if it can be constructed from the existing root
            const readStorage = await MessageStorage(
                {
                    getNode: db.getNode,
                    addNode: db.addNode,
                },
                enc,
                rootKey,
            );

            const conversations = readStorage.getConversations();
            expect(conversations).toEqual(['bob.eth', 'vitalik.eth']);

            const [conversationBob, conversationVitalik] =
                readStorage._tree.getLeafs<any>();

            await conversationBob.fetch();
            await conversationVitalik.fetch();

            expect(conversationBob.getLeafs().length).toBe(1);
            expect(conversationVitalik.getLeafs().length).toBe(1);
            const chunkNode1 = conversationBob.getLeafs()[0];
            const chunkNode2 = conversationVitalik.getLeafs()[0];

            await chunkNode1.fetch();
            await chunkNode2.fetch();

            expect(chunkNode1.getLeafs().length).toBe(3);
            expect(chunkNode2.getLeafs().length).toBe(3);

            expect(chunkNode1.getLeafs()[0]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
            );
            expect(chunkNode1.getLeafs()[1]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
            );
            expect(chunkNode1.getLeafs()[2]).toEqual(
                makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
            );

            expect(chunkNode2.getLeafs()[0]).toEqual(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
            );
            expect(chunkNode2.getLeafs()[1]).toEqual(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello3', 125),
            );
            expect(chunkNode2.getLeafs()[2]).toEqual(
                makeEnvelop('alice.eth', 'vitalik.eth', 'hello5', 127),
            );
        });
    });
    describe('Api', () => {
        describe('getConversations', () => {
            it("returns empty array if there's no conversations", async () => {
                const keyB = '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=';

                const db = testDb();
                const rootKey = sha256('alice.eth');

                const enc = {
                    //encrypt: (val: any) => val,
                    encrypt: (val: any) => encrypt(keyB, val),
                    //decrypt: (val: any) => val,
                    decrypt: (val: any) => decrypt(keyB, val),
                };
                const storage = await MessageStorage(
                    {
                        getNode: db.getNode,
                        addNode: db.addNode,
                    },
                    enc,
                    rootKey,
                );
                expect(storage.getConversations()).toEqual([]);
            });
            it('returns empty array if the conversation is not known', async () => {
                const keyB = '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=';

                const db = testDb();
                const rootKey = sha256('alice.eth');

                const enc = {
                    //encrypt: (val: any) => val,
                    encrypt: (val: any) => encrypt(keyB, val),
                    //decrypt: (val: any) => val,
                    decrypt: (val: any) => decrypt(keyB, val),
                };
                const storage = await MessageStorage(
                    {
                        getNode: db.getNode,
                        addNode: db.addNode,
                    },
                    enc,
                    rootKey,
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
                );
                expect(storage.getConversations()).toEqual([
                    'bob.eth',
                    'vitalik.eth',
                ]);

                expect(await storage.getMessages('random.eth', 0)).toEqual([]);
            });

            it('can retrive messages from new root', async () => {
                const keyB = '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=';

                const db = testDb();
                const rootKey = sha256('alice.eth');

                const enc = {
                    //encrypt: (val: any) => val,
                    encrypt: (val: any) => encrypt(keyB, val),
                    //decrypt: (val: any) => val,
                    decrypt: (val: any) => decrypt(keyB, val),
                };
                const storage = await MessageStorage(
                    {
                        getNode: db.getNode,
                        addNode: db.addNode,
                    },
                    enc,
                    rootKey,
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello3', 125),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello5', 127),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
                );
                const conversations = storage.getConversations();
                expect(conversations).toEqual(['bob.eth', 'vitalik.eth']);

                const messages = await storage.getMessages('bob.eth', 0);
                expect(messages.length).toBe(3);
                expect(messages[0]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
                );
                expect(messages[1]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
                );
                expect(messages[2]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
                );

                const messages2 = await storage.getMessages('vitalik.eth', 0);
                expect(messages2.length).toBe(3);
                expect(messages2[0]).toEqual(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
                );
                expect(messages2[1]).toEqual(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello3', 125),
                );
                expect(messages2[2]).toEqual(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello5', 127),
                );
            });
            it('can retrive messages from existing root', async () => {
                const keyB = '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=';

                const db = testDb();
                const rootKey = sha256('alice.eth');

                const enc = {
                    //encrypt: (val: any) => val,
                    encrypt: (val: any) => encrypt(keyB, val),
                    //decrypt: (val: any) => val,
                    decrypt: (val: any) => decrypt(keyB, val),
                };
                const storage = await MessageStorage(
                    {
                        getNode: db.getNode,
                        addNode: db.addNode,
                    },
                    enc,
                    rootKey,
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello3', 125),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello5', 127),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
                );
                const readStorage = await MessageStorage(
                    {
                        getNode: db.getNode,
                        addNode: db.addNode,
                    },
                    enc,
                    rootKey,
                );
                const conversations = readStorage.getConversations();
                expect(conversations).toEqual(['bob.eth', 'vitalik.eth']);

                const messages = await readStorage.getMessages('bob.eth', 0);
                expect(messages.length).toBe(3);
                expect(messages[0]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
                );
                expect(messages[1]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
                );
                expect(messages[2]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
                );

                const messages2 = await storage.getMessages('vitalik.eth', 0);
                expect(messages2.length).toBe(3);
                expect(messages2[0]).toEqual(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
                );
                expect(messages2[1]).toEqual(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello3', 125),
                );
                expect(messages2[2]).toEqual(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello5', 127),
                );
            });
            it('can paginate messages ', async () => {
                const keyB = '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=';

                const db = testDb();
                const rootKey = sha256('alice.eth');

                const enc = {
                    //encrypt: (val: any) => val,
                    encrypt: (val: any) => encrypt(keyB, val),
                    //decrypt: (val: any) => val,
                    decrypt: (val: any) => decrypt(keyB, val),
                };
                const storage = await MessageStorage(
                    {
                        getNode: db.getNode,
                        addNode: db.addNode,
                    },
                    enc,
                    rootKey,
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello3', 125),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello5', 127),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello7', 129),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello8', 130),
                );

                const conversations = storage.getConversations();
                expect(conversations).toEqual(['bob.eth', 'vitalik.eth']);

                const bobMessagesPage0 = await storage.getMessages(
                    'bob.eth',
                    0,
                );
                expect(bobMessagesPage0.length).toBe(3);
                expect(bobMessagesPage0[0]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
                );
                expect(bobMessagesPage0[1]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
                );
                expect(bobMessagesPage0[2]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
                );
                const bobMessagesPage1 = await storage.getMessages(
                    'bob.eth',
                    1,
                );
                expect(bobMessagesPage1[0]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello7', 129),
                );
                expect(bobMessagesPage1[1]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello8', 130),
                );

                const vitaliksMessages = await storage.getMessages(
                    'vitalik.eth',
                    0,
                );
                expect(vitaliksMessages.length).toBe(3);
                expect(vitaliksMessages[0]).toEqual(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
                );
                expect(vitaliksMessages[1]).toEqual(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello3', 125),
                );
                expect(vitaliksMessages[2]).toEqual(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello5', 127),
                );
            });
            it('returns empty array if all messages have been fetched ', async () => {
                const keyB = '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=';

                const db = testDb();
                const rootKey = sha256('alice.eth');

                const enc = {
                    //encrypt: (val: any) => val,
                    encrypt: (val: any) => encrypt(keyB, val),
                    //decrypt: (val: any) => val,
                    decrypt: (val: any) => decrypt(keyB, val),
                };
                const storage = await MessageStorage(
                    {
                        getNode: db.getNode,
                        addNode: db.addNode,
                    },
                    enc,
                    rootKey,
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello3', 125),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello5', 127),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello7', 129),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello8', 130),
                );

                const conversations = storage.getConversations();
                expect(conversations).toEqual(['bob.eth', 'vitalik.eth']);

                const bobMessagesPage0 = await storage.getMessages(
                    'bob.eth',
                    0,
                );
                expect(bobMessagesPage0.length).toBe(3);
                expect(bobMessagesPage0[0]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
                );
                expect(bobMessagesPage0[1]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
                );
                expect(bobMessagesPage0[2]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
                );
                const bobMessagesPage1 = await storage.getMessages(
                    'bob.eth',
                    1,
                );
                expect(bobMessagesPage1[0]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello7', 129),
                );
                expect(bobMessagesPage1[1]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello8', 130),
                );

                const bobMessagesPage2 = await storage.getMessages(
                    'bob.eth',
                    2,
                );
                expect(bobMessagesPage2).toEqual([]);
            });
            it('can use different size limit ', async () => {
                const keyB = '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=';

                const db = testDb();
                const rootKey = sha256('alice.eth');

                const enc = {
                    //encrypt: (val: any) => val,
                    encrypt: (val: any) => encrypt(keyB, val),
                    //decrypt: (val: any) => val,
                    decrypt: (val: any) => decrypt(keyB, val),
                };
                const storage = await MessageStorage(
                    {
                        getNode: db.getNode,
                        addNode: db.addNode,
                    },
                    enc,
                    rootKey,
                    1000000,
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello3', 125),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello5', 127),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello7', 129),
                );
                await storage.addMessage(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello8', 130),
                );

                const conversations = storage.getConversations();
                expect(conversations).toEqual(['bob.eth', 'vitalik.eth']);

                const bobMessagesPage0 = await storage.getMessages(
                    'bob.eth',
                    0,
                );
                expect(bobMessagesPage0.length).toBe(5);
                expect(bobMessagesPage0[0]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello1', 123),
                );
                expect(bobMessagesPage0[1]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello4', 126),
                );
                expect(bobMessagesPage0[2]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello6', 128),
                );

                expect(bobMessagesPage0[3]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello7', 129),
                );
                expect(bobMessagesPage0[4]).toEqual(
                    makeEnvelop('alice.eth', 'bob.eth', 'hello8', 130),
                );

                const vitaliksMessages = await storage.getMessages(
                    'vitalik.eth',
                    0,
                );
                expect(vitaliksMessages.length).toBe(3);
                expect(vitaliksMessages[0]).toEqual(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello2', 124),
                );
                expect(vitaliksMessages[1]).toEqual(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello3', 125),
                );
                expect(vitaliksMessages[2]).toEqual(
                    makeEnvelop('alice.eth', 'vitalik.eth', 'hello5', 127),
                );
            });
        });
    });
});

const testDb = () => {
    const nodes = new Map<string, any>();
    const addNode = async (key: string, node: any) => {
        nodes.set(key, node);
    };
    const getNode = async (key: string) => {
        return nodes.get(key);
    };
    return { nodes, addNode, getNode };
};

const makeEnvelop = (
    from: string,
    to: string,
    msg: string,
    timestamp: number = 0,
) => {
    const message: Message = {
        metadata: {
            to,
            from,
            timestamp,
            type: 'NEW',
        },
        message: msg,
        signature: '',
    };

    const envelop: Envelop = {
        message,
        metadata: {
            deliveryInformation: {
                from: '',
                to: '',
                deliveryInstruction: '',
            },
            encryptedMessageHash: '',
            version: '',
            encryptionScheme: '',
            signature: '',
        },
    };

    return envelop;
};
