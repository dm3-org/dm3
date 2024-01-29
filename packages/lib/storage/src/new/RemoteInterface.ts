import {
    getDeliveryServiceClient,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { Account } from '@dm3-org/dm3-lib-profile';
import { stringify } from '@dm3-org/dm3-lib-shared';
import axios from 'axios';
import { ethers } from 'ethers';
import { Chunk, Encryption, KeyValueStore } from './types';

const STORAGE_PATH = '/storage/new';

/**
 * This function creates a key-value store which can be used to store
 * and retrieve data from a remote server.
 *
 * @param {string} baseUrl - The base url of the remote server.
 * The base URL must include the ENS account name of the user.
 * @param {string} dsToken - The dsToken of the user for the baseUrl.
 * @param {Encryption} [encryption] - An encryption object to encrypt and decrypt values.
 * @returns {KeyValueStore} A key-value store object.
 */
export function createRemoteKeyValueStoreApi(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    dsToken: string,
    encryption: Encryption,
): KeyValueStore {
    return {
        write: async (key: string, value: Chunk) => {
            const { profile, ensName } = checkAccount(account);
            const encryptedPayload = await encryption.encrypt(stringify(value));
            const url = `${STORAGE_PATH}/${normalizeEnsName(ensName)}/${key}`;

            // eslint-disable-next-line no-console
            console.log('WRITE REMOTEE KEY', encryptedPayload);

            const {} = await getDeliveryServiceClient(
                profile,
                provider,
                async (url: string) => (await axios.get(url)).data,
            ).post(url, encryptedPayload, {
                headers: {
                    Authorization: `Bearer ${dsToken}`,
                    'Content-Type': 'application/json',
                },
            });
        },

        read: async <T extends Chunk>(key: string) => {
            const { profile, ensName } = checkAccount(account);
            const url = `${STORAGE_PATH}/${normalizeEnsName(ensName)}/${key}`;

            const { data } = await getDeliveryServiceClient(
                profile,
                provider,
                async (url: string) => (await axios.get(url)).data,
            ).get(url, {
                headers: {
                    Authorization: `Bearer ${dsToken}`,
                    'Content-Type': 'application/json',
                },
            });

            return data ? ((await encryption.decrypt(data)) as any) : undefined;
        },
    };
}

function checkAccount(account: Account | undefined): Required<Account> {
    if (!account) {
        throw Error('No account');
    }
    if (!account.profile) {
        throw Error('Account has no profile.');
    }
    return account as Required<Account>;
}
