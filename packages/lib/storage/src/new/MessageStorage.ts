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
    const root = await Root.createAndSafe(db, enc, rootKey);

    const addMessage = (envelop: Envelop) => root.add(envelop);
    const getConversations = () => root.conversationNames;

    return { addMessage, getConversations, _tree: root };
};

type Leaf = Node | Envelop;

type ChunkIdentifier = {
    id: number;
    timestamp: number;
};

const DEFAULT_SIZE_LIMIT = 1000;
abstract class Node {
    public readonly key: string;
    public readonly db: IStorageDatabase;
    public readonly enc: IStorageEncryption;

    private readonly sizeLimit: number;
    private leafs: Leaf[];

    protected constructor(
        db: IStorageDatabase,
        enc: IStorageEncryption,
        key: string,
        children: Node[] | Envelop[],
        sizeLimit = DEFAULT_SIZE_LIMIT,
    ) {
        this.key = key;
        this.db = db;
        this.enc = enc;
        this.leafs = children;
        this.sizeLimit = sizeLimit;
    }
    public getLeafs<T extends Leaf>() {
        return this.leafs as T[];
    }
    public addLeaf(leaf: Leaf) {
        this.leafs.push(leaf);
    }
    public setLeafs(leafs: Leaf[]) {
        this.leafs = leafs;
    }

    public hasSpace(newLeaf: Leaf) {
        const newLeafs = JSON.stringify([...this.leafs, newLeaf]);
        return Buffer.byteLength(newLeafs, 'utf-8') < this.sizeLimit;
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
    public readonly conversationNames: string[];

    private constructor(
        db: IStorageDatabase,
        enc: IStorageEncryption,
        key: string,
        children: Node[],
        conversationNames: string[] = [],
    ) {
        super(db, enc, key, children);
        this.conversationNames = conversationNames;
    }

    static async createAndSafe(
        db: IStorageDatabase,
        enc: IStorageEncryption,
        key: string,
    ) {
        //Get the serialized and encrypted root node from the database (that is the conversation list)
        const serialized = await db.getNode(key);
        // If the root does not exist now we're creating a new instance and return it
        if (!serialized) {
            const instance = new Root(db, enc, key, [], []);
            //Safe the newly created instance to the database
            await instance.save();
            return instance;
        }
        // deserialized valueis the conversation list as a string[]
        const conversationNames = await this.deserialize(enc, serialized);

        const conversationInstances = conversationNames.map(
            (conversationKey: string) =>
                new Conversation(db, enc, conversationKey, []),
        );

        return new Root(db, enc, key, conversationInstances, conversationNames);
    }

    public async add(envelop: Envelop) {
        let conversation = this.getLeafs<Conversation>().find(
            (c) =>
                c.key ===
                Conversation.computeKey(this.key, envelop.message.metadata.to),
        );
        //Conversation does not exist yet
        if (!conversation) {
            //Conversation name is the recipient
            const conversationName = envelop.message.metadata.to;
            //Add new conversation to the storage
            conversation = await Conversation.createAndSafe(
                this.db,
                this.enc,
                Conversation.computeKey(this.key, conversationName),
                [],
            );
            //Add the conversation to the root
            this.addLeaf(conversation);
            //Add the conversation name to the conversation list
            this.conversationNames.push(conversationName);
        }
        return await conversation.add(envelop);
    }
}

class Conversation extends Node {
    public static async createAndSafe(
        db: IStorageDatabase,
        enc: IStorageEncryption,
        key: string,
        children: Node[] | Envelop[],
    ) {
        const instance = new Conversation(db, enc, key, children);
        await instance.save();
        return instance;
    }
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
        //Fetch conversatin chunks to get the last lists of chunks
        const serializedChunks = await this.db.getNode(this.key);
        if (!serializedChunks) {
            //Shold not happen in because a conversation is always created before
            throw 'Conversation does not exist yet';
        }
        // deserialize the encrypted chunks
        const chunkIdentifier = await Chunk.deserialize(
            this.enc,
            serializedChunks,
        );
        //map the chunk identifier to chunk instances
        const chunkInstances = chunkIdentifier.map(
            (chunk: any) => new Chunk(this.db, this.enc, chunk.id, []),
        );

        //update the conversation with the latest list of chunks
        this.setLeafs(chunkInstances);

        // the first chunk has to be created
        if (this.getLeafs<Node>().length === 0) {
            //Create the first chunk
            const emptyChunIdentifer: ChunkIdentifier = {
                //0 is the first index
                id: 0,
                //the timestamp of the first message
                timestamp: message.message.metadata.timestamp,
            };
            const chunk = await Chunk.createAndSafe(
                this.db,
                this.enc,
                Chunk.computeKey(this.key, emptyChunIdentifer),
            );
            //Add the chunk to the conversation
            this.addLeaf(chunk);
            await chunk.add(message);
            await this.save();
            return;
        }

        //get the latest chunk
        const latestChunk = this.getLeafs<Chunk>()[this.getLeafs().length - 1];
        //Fetch all envelops of the chunk to determine if the chunk is full
        await latestChunk.fetch();

        if (latestChunk.hasSpace(message)) {
            //Add the message to the chunk
            await latestChunk.add(message);
            return;
        }

        //If the chunk is full create a new chunk
        const emptyChunkIdentifer: ChunkIdentifier = {
            //the id is the number of chunks
            id: this.getLeafs().length,
            //the timestamp of the first message
            timestamp: message.message.metadata.timestamp,
        };
        //Create new chunk
        const emptyChunk = await Chunk.createAndSafe(
            this.db,
            this.enc,
            Chunk.computeKey(this.key, emptyChunkIdentifer),
        );
        //Add the chunk to the conversation
        this.addLeaf(emptyChunk);
        //finally the chunk that'll contain the message has been created and sits at the end of the list
        await emptyChunk.add(message);
        await await this.save();
    }
}

class Chunk extends Node {
    public static async createAndSafe(
        db: IStorageDatabase,
        enc: IStorageEncryption,
        key: string,
    ) {
        const instance = new Chunk(db, enc, key, []);
        await instance.save();
        return instance;
    }
    public async add(message: Envelop) {
        //add message to envelop array
        this.addLeaf(message);
        //persist the chunk
        await this.save();
    }

    public async fetch() {
        const serializedEnvelops = await this.db.getNode(this.key);
        if (!serializedEnvelops) {
            //Shold not happen in because the chunk is always created before
            throw 'Chunk does not exist yet';
        }
        // deserialize the encrypted chunks
        const envelops = await Node.deserialize(this.enc, serializedEnvelops);

        //update the conversation with the latest list of chunks
        this.setLeafs(envelops);
    }
    public static computeKey(
        conversationKey: string,
        chunkIdentifier: ChunkIdentifier,
    ) {
        return sha256(conversationKey + JSON.stringify(chunkIdentifier));
    }
}
