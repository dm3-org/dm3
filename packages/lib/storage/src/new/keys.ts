import { sha256 } from '@dm3-org/dm3-lib-shared';
import { Db } from './types';

/**
 * This function generates a unique key for the account manifest.
 * It does this by signing the account's ENS name using the database's sign function,
 * and then hashing the result using SHA-256.
 *
 * @param {Db} db - The database object, which contains the account's ENS name and the sign function.
 * @returns {Promise<string>} A promise that resolves to the account manifest key.
 */
export async function getAccountManifestKey(db: Db): Promise<string> {
    return sha256(await db.sign(db.accountEnsName));
}

/**
 * This function generates a unique key for the conversation list.
 * It does this by hashing the account manifest key and the page number using SHA-256.
 *
 * @param {Db} db - The database object, which contains the account's ENS name and the sign function.
 * @param {number} page - The page number.
 * @returns {Promise<string>} A promise that resolves to the conversation list key.
 */
export async function getConversationListKey(
    db: Db,
    page: number,
): Promise<string> {
    return sha256((await getAccountManifestKey(db)) + page);
}

/**
 * This function generates a unique key for a conversation manifest.
 * It does this by first getting the account manifest key, appending the contact's ENS name to it,
 * and then hashing the result using SHA-256.
 *
 * @param {Db} db - The database object, which contains the account's ENS name and the sign function.
 * @param {string} contactEnsName - The ENS name of the contact.
 * @returns {Promise<string>} A promise that resolves to the conversation manifest key.
 */
export async function getConversationManifestKey(
    db: Db,
    contactEnsName: string,
): Promise<string> {
    return sha256((await getAccountManifestKey(db)) + contactEnsName);
}

/**
 * This function generates a unique key for a message chunk.
 * It does this by first getting the conversation manifest key, appending the page number to it,
 * and then hashing the result using SHA-256.
 *
 * @param {Db} db - The database object, which contains the account's ENS name and the sign function.
 * @param {string} contactEnsName - The ENS name of the contact.
 * @param {number} page - The page number.
 * @returns {Promise<string>} A promise that resolves to the message chunk key.
 */
export async function getMessageChunkKey(
    db: Db,
    contactEnsName: string,
    page: number,
): Promise<string> {
    return sha256(
        (await getConversationManifestKey(db, contactEnsName)) + page,
    );
}
