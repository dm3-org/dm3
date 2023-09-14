import { Envelop } from 'dm3-lib-messaging';
import { sha256 } from 'dm3-lib-shared';

export interface IStorageDatabase {
    addNode: (key: string, value: any) => Promise<void>;
    getNode: (key: string) => Promise<string | undefined>;
}

export interface IStorageEncryption {
    encrypt: (string: any) => Promise<any>;
    decrypt: (string: any) => Promise<any>;
}

//The Sturct used in the frontend to store the messages
export const MessageStorage = async (
    db: IStorageDatabase,
    enc: IStorageEncryption,
    rootKey: string,
) => {
    const root = await Root.instance(db, enc, rootKey);

    const addMessage = (envelop: Envelop) => root.add(envelop);

    return { addMessage };
};

type Leaf = Node | Envelop;

abstract class Node {
    public readonly key: string;
    public readonly db: IStorageDatabase;
    public readonly enc: IStorageEncryption;

    private readonly leafs: Leaf[];

    public getLeafs<T extends Leaf>() {
        return this.leafs as T[];
    }
    public addLeaf(leaf: Leaf) {
        this.leafs.push(leaf);
    }

    constructor(
        db: IStorageDatabase,
        enc: IStorageEncryption,
        key: string,
        children: Node[] | Envelop[],
    ) {
        this.key = key;
        this.db = db;
        this.enc = enc;
        this.leafs = children;
    }
    protected async save() {
        const encrypted = await this.enc.encrypt(this.serialize());
        await this.db.addNode(this.key, encrypted);
    }

    protected serialize() {
        return JSON.stringify(this.leafs);
    }

    static async deserialize(enc: IStorageEncryption, serialized: string) {
        //Decrypt the serialized node
        const decrypted = await enc.decrypt(serialized);
        //Parse the decrypted node
        return JSON.parse(decrypted);
    }
    public abstract add(envelop: Envelop): Promise<void>;
}

class Root extends Node {
    static async instance(
        db: IStorageDatabase,
        enc: IStorageEncryption,
        key: string,
    ) {
        //Get the serialized and encrypted root node from the database
        const serialized = await db.getNode(key);
        // If the root does not exist now we're creating a new instance and return it
        if (!serialized) {
            const instance = new Root(db, enc, key, []);
            //Safe the newly created instance to the database
            await instance.save();
            return instance;
        }

        const deserialized = await this.deserialize(enc, serialized);

        return new Root(db, enc, key, deserialized);
    }

    public async add(envelop: Envelop) {
        let conversation = this.getLeafs<Node>().find(
            (c) =>
                c.key ===
                Conversation.computeKey(this.key, envelop.message.metadata.to),
        );
        if (!conversation) {
            conversation = new Conversation(
                this.db,
                this.enc,
                Conversation.computeKey(this.key, envelop.message.metadata.to),
                [],
            );
        }
        return (conversation as Node).add(envelop);
    }
}

class Conversation extends Node {
    protected override serialize() {
        const mapped = this.getLeafs<Node>().map((c) => ({
            id: c.key,
            timestamp: c.getLeafs<Envelop>()[0].message.metadata.timestamp,
        }));

        return JSON.stringify(mapped);
    }

    protected async parse(serialized: any): Promise<Node> {
        const decrypted = await this.enc.decrypt(serialized);
        const parsed = JSON.parse(decrypted);
        const chunks = await Promise.all(
            parsed.map(async (c: any) => {
                const chunk = await this.db.getNode(c.id);
                return this.parse(chunk);
            }),
        );
        return new Conversation(this.db, this.enc, this.key, chunks);
    }

    public static computeKey(rootKey: string, to: string) {
        return sha256(rootKey + to);
    }

    public async add(message: Envelop) {
        //If message fits into the existing chunk add it
        this.getLeafs<Node>()[this.getLeafs<Node>().length - 1].add(message);
        //Else add new chunk
        //And add it there
    }
}

class Chunk extends Node {
    public async add(message: Envelop) {
        this.addLeaf(message);
    }
}
