import { Envelop, Message } from 'dm3-lib-messaging';
import { MessageStorage } from './MessageStorage';
import { sha256 } from 'dm3-lib-shared';

describe('MessageStorage', () => {
    it.only('creates empty root if not present in the database', async () => {
        const db = testDb();
        const rootKey = sha256('alice.eth');
        const enc = {
            encrypt: (val: any) => val,
            decrypt: (val: any) => val,
        };
        await MessageStorage(db, enc, rootKey);

        expect(db.nodes.size).toBe(1);
        expect(db.nodes.get(rootKey)).toEqual(JSON.stringify([]));
    });
});

const testDb = () => {
    const nodes = new Map<string, any>();
    const addNode = async (key: string, node: any) => {
        console.log(nodes);
        nodes.set(key, node);
        console.log(nodes);
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
