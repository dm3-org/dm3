import { stringify } from '@dm3-org/dm3-lib-shared';
import { Chunk, Encryption, KeyValueStore } from './types';
import axios from 'axios';

/**
 * This function creates a key-value store which can be used to store
 * and retrieve data from a remote server.
 *
 * @param {string} baseUrl - The base url of the remote server.
 * The base URL must include the ENS account name of the user.
 * @param {Encryption} [encryption] - An encryption object to encrypt and decrypt values.
 * @returns {KeyValueStore} A key-value store object.
 */
export function createRemoteKeyValueStoreApi(
    baseUrl: string,
    encryption: Encryption,
): KeyValueStore {
    return {
        write: async (key: string, value: Chunk) => {
            await axios.post(
                `${baseUrl}/${key}`,
                await encryption.encrypt(stringify(value)),
            );
        },

        read: async <T extends Chunk>(key: string) => {
            const result = (await axios.get(`${baseUrl}/${key}`)).data;
            return result
                ? (JSON.parse(await encryption.decrypt(result.toString())) as T)
                : undefined;
        },
    };
}
