import { logInfo } from '@dm3-org/dm3-lib-shared';
import {
    getAccountManifestKey,
    getConversationListKey,
    getConversationManifestKey,
    getMessageChunkKey,
} from './keys';
import {
    AccountManifest,
    Chunk,
    ConversationList,
    ConversationManifest,
    Db,
    INITIAL_ACCOUNT_MANIFEST,
    MessageChunk,
    ReadStrategy,
    RemoteFetchCb,
} from './ChunkStorageTypes';

/**
 * This function retrieves a specific chunk of messages for a given conversation from the storage.
 *
 * @param {Db} db - The database object, which contains the account's ENS name and the sign function.
 * @param {string} contactEnsName - The ENS name of the contact.
 * @param {number} page - The page number of the message chunk to retrieve.
 * @returns {Promise<MessageChunk | undefined>} A promise that resolves to the message chunk
 *  or undefined if the chunk does not exist.
 */
export async function getMessageChunk(
    db: Db,
    contactEnsName: string,
    page: number,
): Promise<MessageChunk | undefined> {
    const messageChunkKey = await getMessageChunkKey(db, contactEnsName, page);
    return getMessageChunkByKey(db, messageChunkKey);
}
export async function getMessageChunkByKey(
    db: Db,
    messageChunkKey: string,
): Promise<MessageChunk | undefined> {
    return readFromStrorage<MessageChunk>(messageChunkKey, db);
}

/**
 * This function retrieves a specific chunk of conversations from the storage.
 *
 * @param {Db} db - The database object, which contains the account's ENS name and the sign function.
 * @param {number} page - The page number of the conversation chunk to retrieve.
 * @returns {Promise<ConversationList | undefined>} A promise that resolves to the conversation chunk
 *  or undefined if the chunk does not exist.
 */
export async function getConversationListChunk(db: Db, page: number) {
    const conversationChunkKey = await getConversationListKey(db, page);
    return readFromStrorage<ConversationList>(conversationChunkKey, db);
}

/**
 * This function retrieves the total number of messages in a conversation.
 *
 * @param {string} contactEnsName - The ENS name of the contact.
 * @param {Db} db - The database object, which contains the account's ENS name and the sign function.
 * @returns {Promise<number>} A promise that resolves to the total number of messages in the conversation.
 * @throws {Error} If the conversation manifest does not exist.
 */
export async function getNumberOfMessages(
    contactEnsName: string,
    db: Db,
): Promise<number> {
    const conversationManifestKey = await getConversationManifestKey(
        db,
        contactEnsName,
    );
    const conversationManifest = await readFromStrorage<ConversationManifest>(
        conversationManifestKey,
        db,
    );
    //Conversation has not been created yet, hence we return 0
    if (!conversationManifest) {
        return 0;
    }

    return conversationManifest.messageCounter;
}

/**
 * This function retrieves the manifest for a specific conversation.
 *
 * @param {string} contactEnsName - The ENS name of the contact.
 * @param {Db} db - The database object, which contains the account's ENS name and the sign function.
 * @returns {Promise<ConversationManifest>} A promise that resolves to the conversation manifest.
 * @throws {Error} If the conversation manifest does not exist.
 */
export async function getConversationManifest(
    contactEnsName: string,
    db: Db,
): Promise<ConversationManifest | undefined> {
    const conversationManifestKey = await getConversationManifestKey(
        db,
        contactEnsName,
    );
    const conversationManifest = await readFromStrorage<ConversationManifest>(
        conversationManifestKey,
        db,
    );

    if (!conversationManifest) {
        return undefined;
    }

    return conversationManifest;
}

/**
 * This function retrieves the manifest for the account.
 *
 * @param {Db} db - The database object, which contains the account's ENS name and the sign function.
 * @returns {Promise<AccountManifest>} A promise that resolves to the account manifest.
 * @throws {Error} If the account manifest does not exist.
 */
export async function getAccountManifest(db: Db): Promise<AccountManifest> {
    const accountManifestKey = await getAccountManifestKey(db);
    const accountMainfest = await readFromStrorage<AccountManifest>(
        accountManifestKey,
        db,
    );

    if (accountMainfest) {
        return accountMainfest;
    }
    logInfo('Initially creating account manifest');
    await db.keyValueStoreLocal.write(
        accountManifestKey,
        INITIAL_ACCOUNT_MANIFEST(accountManifestKey),
    );
    return INITIAL_ACCOUNT_MANIFEST(accountManifestKey);
}

/**
 * This function retrieves the total number of conversations associated with an account.
 *
 * @param {Db} db - The database object, which contains the account's ENS name and the sign function.
 * @returns {Promise<number>} A promise that resolves to the total number of conversations.
 * @throws {Error} If the account manifest does not exist.
 */
export async function getNumberOfConverations(db: Db): Promise<number> {
    const accountMainfest = await getAccountManifest(db);
    return accountMainfest.conversationListCounter;
}

async function localRead<T extends Chunk>(db: Db, key: string) {
    return (await db.keyValueStoreLocal.read(key)) as T | undefined;
}

async function remoteRead<T extends Chunk>(
    db: Db,
    key: string,
    remoteFetchCb: RemoteFetchCb,
) {
    if (db.keyValueStoreRemote) {
        const remoteChunk: T | undefined = await db.keyValueStoreRemote.read(
            key,
        );

        if (remoteChunk) {
            remoteFetchCb(key, remoteChunk);
            return remoteChunk;
        }
    }
    return undefined;
}

async function localFirstRead<T extends Chunk>(
    key: string,
    db: Db,
    remoteFetchCb: RemoteFetchCb,
) {
    /**
     * This code attempts to read data of type T from the local storage using the key.
     * If the data is not found in the local storage (i.e., localRead returns null or undefined),
     * it then tries to read the data from the remote storage using the same key
     * and a callback function for fetching the data.
     * The function returns the data retrieved from the local or remote storage,
     * or undefined if the data is not found in either.
     */
    return (
        (await localRead<T>(db, key)) ??
        (await remoteRead<T>(db, key, remoteFetchCb))
    );
}

async function remoteFirstRead<T extends Chunk>(
    key: string,
    db: Db,
    remoteFetchCb: RemoteFetchCb,
): Promise<T | undefined> {
    /**
     * This code attempts to read data of type T from the remote storage using the key.
     * If the data is not found in the remote storage (i.e., remoteRead returns null or undefined),
     * it then tries to read the data from the local storage using the same key.
     * The function returns the data retrieved from the remote or local storage,
     * or undefined if the data is not found in either.
     */
    return (
        (await remoteRead<T>(db, key, remoteFetchCb)) ??
        (await localRead<T>(db, key))
    );
}

async function readFromStrorage<T extends Chunk>(
    key: string,
    db: Db,
): Promise<T | undefined> {
    switch (db.readStrategy) {
        case ReadStrategy.LocalFirst:
            return localFirstRead<T>(
                key,
                db,
                db.updateLocalStorageOnRemoteRead,
            );

        case ReadStrategy.RemoteFirst:
            return remoteFirstRead<T>(
                key,
                db,
                db.updateLocalStorageOnRemoteRead,
            );

        default:
            return undefined;
    }
}
