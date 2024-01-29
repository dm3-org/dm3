import { stringify } from '@dm3-org/dm3-lib-shared';
import { Chunk, Encryption, KeyValueStore } from './types';
import { BaseTrie as Trie } from 'merkle-patricia-tree';
import { getAccountManifest } from './read';

/**
 * This function creates a key-value store which can be used to store
 * and retrieve data from a merkle-patricia-tree.
 *
 * @param {Encryption} [encryption] - An encryption object to encrypt and decrypt values.
 * @returns {KeyValueStore} A key-value store object.
 */
export function createKeyValueStore(encryption: Encryption): KeyValueStore {
    const trie = new Trie();

    return {
        write: async (key: string, value: Chunk) => {
            await trie.put(
                Buffer.from(key),
                Buffer.from(await encryption.encrypt(stringify(value))),
            );
        },

        read: async <T extends Chunk>(key: string) => {
            const result = await trie.get(Buffer.from(key));
            if (!result) {
                return undefined;
            }
            const decrypted = await encryption.decrypt(
                result?.toString() ?? '',
            );
            return decrypted as any;
        },
    };
}
