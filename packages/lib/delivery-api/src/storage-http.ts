import { Account, getDeliveryServiceClient } from '@dm3-org/dm3-lib-profile';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import axios from 'axios';
import { ethers } from 'ethers';
import { getAxiosConfig, checkAccount } from './utils';

const STORAGE_PATH = '/storage/new';

export async function setStorageChunk(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,

    key: string,
    value: string,
    token: string,
): Promise<string> {
    const { profile, ensName } = checkAccount(account);

    const url = `${STORAGE_PATH}/${normalizeEnsName(ensName)}/${key}`;

    const { data } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.get(url)).data,
    ).post(url, value, getAxiosConfig(token));

    return data;
}
export type SetStorageChunk = typeof setStorageChunk;

export async function getStorageChunk(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    key: string,
    token: string,
): Promise<string> {
    const { profile, ensName } = checkAccount(account);

    const url = `${STORAGE_PATH}/${normalizeEnsName(ensName)}/${key}`;

    const { data } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.get(url)).data,
    ).get(url, getAxiosConfig(token));

    return data ?? '';
}
export type GetStorageChunk = typeof getStorageChunk;
