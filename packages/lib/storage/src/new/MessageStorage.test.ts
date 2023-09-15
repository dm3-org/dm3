import { Envelop, Message } from 'dm3-lib-messaging';
import { MessageStorage } from './MessageStorage';
import { sha256 } from 'dm3-lib-shared';
import { decrypt, encrypt } from 'dm3-lib-crypto';

describe('MessageStorage', () => {
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
    it('gets conversations', async () => {
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

        await storage.addMessage(
            makeEnvelop('alice.eth', 'bob.eth', 'hello', 123),
        );
        const conversations = storage.getConversations();
        expect(conversations).toEqual(['bob.eth']);
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
