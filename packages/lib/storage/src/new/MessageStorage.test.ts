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
        const storage = await MessageStorage(db, enc, rootKey);

        expect(db.nodes.size).toBe(1);
        expect(db.nodes.get(rootKey)).toEqual(JSON.stringify([]));
        expect(storage.getConversations()).toEqual([]);
    });

    it('gets conversations', async () => {
        const db = testDb();
        const rootKey = sha256('alice.eth');

        const enc = {
            encrypt: (val: any) => val,
            decrypt: (val: any) => val,
        };
        const storage = await MessageStorage(db, enc, rootKey);

        await storage.addMessage(makeEnvelop('alice.eth', 'bob.eth', 'hello'));
        const conversations = storage.getConversations();
        expect(conversations).toEqual(['bob.eth']);
    });
    it('encryptes and decryptes conversations', async () => {
        const keyB = '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=';

        const db = testDb();
        const rootKey = sha256('alice.eth');

        const enc = {
            encrypt: (val: any) => encrypt(keyB, val),
            decrypt: (val: any) => decrypt(keyB, val),
        };
        const storage = await MessageStorage(db, enc, rootKey);

        await storage.addMessage(makeEnvelop('alice.eth', 'bob.eth', 'hello'));
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
