import { Envelop } from 'dm3-lib-messaging';
import { sha256 } from 'dm3-lib-shared';
/**
 * Interface for a storage database module.
 */
export interface IStorageDatabase {
    /**
     * Adds a key-value pair to the database asynchronously.
     *
     * @param key - The key to use for storing the value.
     * @param value - The value to store in the database.
     * @returns A promise that resolves when the operation is complete.
     */
    addNode: (key: string, value: any) => Promise<void>;
    /**
     * Retrieves the value associated with the provided key from the database asynchronously.
     *
     * @param key - The key to use for retrieving the value.
     * @returns A promise that resolves to the value associated with the key or `undefined` if the key is not found.
     */
    getNode: (key: string) => Promise<string | undefined>;
}

/**
 * Interface for a storage encryption module.
 */
export interface IStorageEncryption {
    /**
     * Encrypts the provided data asynchronously.
     *
     * @param data - The data to encrypt.
     * @returns A promise that resolves to the encrypted data.
     */
    encrypt: (string: any) => Promise<any>;
    /**
     * Decrypts the provided encrypted data asynchronously.
     *
     * @param encryptedData - The encrypted data to decrypt.
     * @returns A promise that resolves to the decrypted data.
     */

    decrypt: (string: any) => Promise<any>;
}

/**
 * A utility for storing and managing messages using a hierarchical storage structure.
 * According to the DM3 message storage specification
 * https://dm3.readthedocs.io/en/doc-latest/specification/message-storage/msp-datastructure.html#architecture
 *
 * @param db - The storage database to use. @see {IStorageDatabase}
 * @param enc - The storage encryption module to use. @see {IStorageEncryption}
 * @param rootKey - The root key for the message storage.
 * @param sizeLimit - (Optional) The size limit for the message storage.
 * @returns An object containing functions for adding messages, retrieving conversations, and retrieving messages.
 */
export const MessageStorage = async (
    db: IStorageDatabase,
    enc: IStorageEncryption,
    rootKey: string,
    sizeLimit: number = DEFAULT_SIZE_LIMIT,
) => {
    const root = await Root.initialize(db, enc, rootKey, sizeLimit);

    const addMessage = (envelop: Envelop) => root.add(envelop);
    const getConversations = () => root.conversationNames;
    const getMessages = async (conversationName: string, page: number) => {
        //First get the corosponding conversation
        const conversation = root
            .getLeafs<Conversation>()
            .find(
                (c) =>
                    c.key ===
                    Conversation.computeKey(rootKey, conversationName),
            );
        //If the conversation does not exist return an empty array
        if (!conversation) {
            return [];
        }
        //Fetch the conversation nodes from the database
        await conversation.fetch();
        //Get the chunks of the conversation
        const chunks = conversation.getLeafs<Chunk>();
        const chunk = chunks[page];
        if (!chunk) {
            return [];
        }
        //Fetch the chunk nodes from the database to get the actual messages
        await chunk.fetch();
        //Return the messages
        return chunk.getLeafs<Envelop>();
    };

    return { addMessage, getMessages, getConversations, _tree: root };
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

    public readonly sizeLimit: number;
    private leafs: Leaf[];

    protected constructor(
        db: IStorageDatabase,
        enc: IStorageEncryption,
        sizeLimit: number,
        key: string,
        children: Leaf[],
    ) {
        this.key = key;
        this.db = db;
        this.enc = enc;
        this.leafs = children;
        this.sizeLimit = sizeLimit;
    }
    public abstract add(envelop: Envelop): Promise<void>;

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
        //newLeafs is the structure that is about to get stored in the database
        //it has to be smaller than the size limit. Otherwise the chunk would be too big
        const newLeafs = JSON.stringify([...this.leafs, newLeaf]);
        return Buffer.byteLength(newLeafs, 'utf-8') < this.sizeLimit;
    }

    protected async save() {
        //encrypt the serialized node using the provided encryption function
        const encrypted = await this.enc.encrypt(this.serialize());
        //save the encrypted node to the database
        await this.db.addNode(this.key, encrypted);
    }
    /**
     * Asynchronously loads and deserializes a node from the database.
     *
     * @throws {string} Throws an error if the node does not exist in the database.
     * @returns {Promise<Node>} A Promise that resolves to the deserialized node.
     */
    protected async load() {
        //Get the serialized and encrypted node from the database
        const serializedNode = await this.db.getNode(this.key);
        if (!serializedNode) {
            //Shold not happen in because the chunk is always created before
            throw 'Node does not exist yet';
        }
        //Decrypt the serialized node
        return await Node.deserialize(this.enc, serializedNode);
    }

    /**
     * Serializes the node to a string representation.
     *
     * @returns {string} The serialized representation of the object.
     */
    protected serialize() {
        //default serialization is JSON.stringify the leafs
        return JSON.stringify(this.leafs);
    }
    /**
     * Deserializes a string representation into an Node object.
     *
     * @param {IStorageEncryption} enc - The encryption service to use for decryption.
     * @param {string} serialized - The string representation to deserialize.
     * @returns {Promise<any>} A Promise that resolves to the deserialized object.
     */
    protected static async deserialize(
        enc: IStorageEncryption,
        serialized: string,
    ) {
        //Decrypt the serialized node
        const decrypted = await enc.decrypt(serialized);
        //Parse the decrypted node
        return JSON.parse(decrypted);
    }
}

class Root extends Node {
    public readonly conversationNames: string[];

    private constructor(
        db: IStorageDatabase,
        enc: IStorageEncryption,
        sizeLimit: number,
        key: string,
        children: Node[],
        conversationNames: string[] = [],
    ) {
        super(db, enc, sizeLimit, key, children);
        this.conversationNames = conversationNames;
    }

    static async initialize(
        db: IStorageDatabase,
        enc: IStorageEncryption,
        rootKey: string,
        sizeLimit: number,
    ) {
        //Get the serialized and encrypted root node from the database (that is the conversation list)
        const serialized = await db.getNode(rootKey);
        // If the root does not exist now we're creating a new instance and return it
        if (!serialized) {
            const instance = new Root(db, enc, sizeLimit, rootKey, [], []);
            //Safe the newly created instance to the database
            await instance.save();
            return instance;
        }
        // deserialized valueis the conversation list as a string[]
        const conversationNames = await this.deserialize(enc, serialized);

        const conversationInstances = conversationNames.map(
            (ensName: string) =>
                new Conversation(
                    db,
                    enc,
                    sizeLimit,
                    Conversation.computeKey(rootKey, ensName),
                    [],
                ),
        );

        return new Root(
            db,
            enc,
            sizeLimit,
            rootKey,
            conversationInstances,
            conversationNames,
        );
    }

    public async add(envelop: Envelop) {
        const conversation = this.getLeafs<Conversation>().find(
            (c) =>
                c.key ===
                Conversation.computeKey(this.key, envelop.message.metadata.to),
        );
        //If the conversation exists add the message to the conversation.
        //Otherwise create a new conversation and add the message
        return conversation
            ? await conversation.add(envelop)
            : await this.createNewConversationAndAddMessage(envelop);
    }

    protected override serialize() {
        //Default serialization is JSON.stringify the leafs
        return JSON.stringify(this.conversationNames);
    }

    private async createNewConversationAndAddMessage(envelop: Envelop) {
        //Conversation name is the recipient
        const conversationName = envelop.message.metadata.to;
        //Add new conversation to the storage
        const newConversation = await Conversation.createAndSafe(
            this.db,
            this.enc,
            this.sizeLimit,
            Conversation.computeKey(this.key, conversationName),
            [],
        );
        //Add the conversation to the root
        this.addLeaf(newConversation);
        //Add the conversation name to the conversation list
        this.conversationNames.push(conversationName);
        await newConversation.add(envelop);
        await this.save();
    }
}

class Conversation extends Node {
    public static async createAndSafe(
        db: IStorageDatabase,
        enc: IStorageEncryption,
        sizeLimit: number,
        key: string,
        children: Node[] | Envelop[],
    ) {
        const instance = new Conversation(db, enc, sizeLimit, key, children);
        await instance.save();
        return instance;
    }
    protected override serialize() {
        //Conversations are serialited according the the spec
        const mapped = this.getLeafs<Node>().map((c) => ({
            id: c.key,
            timestamp: c.getLeafs<Envelop>()[0].message.metadata.timestamp,
        }));

        return JSON.stringify(mapped);
    }

    public static computeKey(rootKey: string, to: string) {
        return sha256(rootKey + to);
    }

    public async add(message: Envelop) {
        const conversationIsEmpty = this.getLeafs<Node>().length === 0;
        // the first chunk has to be created
        if (conversationIsEmpty) {
            await this.createNewChunkAndAddMessage(message);
            return;
        }

        //get the latest chunk
        const latestChunk = this.getLeafs<Chunk>()[this.getLeafs().length - 1];
        //Fetch all envelops of the chunk to determine if the chunk is full
        await latestChunk.fetch();

        //Check if the chunk is full if the message would be added
        const chunkIsFull = !latestChunk.hasSpace(message);
        //If the chunk is full create a new chunk
        if (chunkIsFull) {
            //Add the message to the chunk
            await this.createNewChunkAndAddMessage(message);
            return;
        }
        //If the chunk is not full add the message to the chunk
        await latestChunk.add(message);
    }
    public async fetch() {
        const chunkIdentifier = await this.load();
        //map the chunk identifier to chunk instances
        const chunkInstances = chunkIdentifier.map(
            (chunk: any) =>
                new Chunk(this.db, this.enc, this.sizeLimit, chunk.id, []),
        );

        //update the conversation with the latest list of chunks
        this.setLeafs(chunkInstances);
    }
    private async createNewChunkAndAddMessage(message: Envelop) {
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
            this.sizeLimit,
            Chunk.computeKey(this.key, emptyChunkIdentifer),
        );
        //Add the chunk to the conversation
        this.addLeaf(emptyChunk);
        //finally the chunk that'll contain the message has been created and sits at the end of the list
        await emptyChunk.add(message);
        await this.save();
    }
}

class Chunk extends Node {
    public static async createAndSafe(
        db: IStorageDatabase,
        enc: IStorageEncryption,
        sizeLimit: number,
        key: string,
    ) {
        const instance = new Chunk(db, enc, sizeLimit, key, []);
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
        const envelops = await this.load();
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
