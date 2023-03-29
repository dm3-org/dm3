import axios from 'axios';
import { UserDB } from '..';
import {
    normalizeEnsName,
    getDeliveryServiceClient,
    Account,
} from 'dm3-lib-account';
import { Acknoledgment } from 'dm3-lib-delivery';
import { log } from 'dm3-lib-shared';
import { sync } from '../Storage';
import { ethers } from 'ethers';

const STORAGE_SERVICE = '/storage';

function getAxiosConfig(token: string) {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}

export async function useDm3Storage(
    provider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
    userDb: UserDB,
    token: string,
): Promise<Acknoledgment[]> {
    const syncResult = await sync(userDb, token);
    log(`[dm3 Storage] Saving user storage`);

    const { profile, ensName } = account;

    const url = `${STORAGE_SERVICE}/${normalizeEnsName(ensName)}`;

    await await getDeliveryServiceClient(
        profile!,
        provider!,
        async (url) => (await axios.get(url)).data,
    ).post(url, syncResult.userStorage, getAxiosConfig(token));
    return syncResult.acknoledgments;
}

export async function getDm3Storage(
    provider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
    token: string,
): Promise<string | undefined> {
    log(`[dm3 Storage] Get user storage`);

    const { profile, ensName } = account!;

    const url = `${STORAGE_SERVICE}/${normalizeEnsName(ensName)}`;
    const { data } = await getDeliveryServiceClient(
        profile!,
        provider!,
        async (url) => (await axios.get(url)).data,
    ).get(url, getAxiosConfig(token));

    return data;
}
