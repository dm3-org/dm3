import axios from 'axios';
import { UserDB } from '..';
import { normalizeEnsName } from '../../account/src';
import { Acknoledgment } from '../../delivery/src';
import { getDeliveryServiceClient } from '../../account/src/deliveryServiceProfile/Delivery';
import { log } from '../../shared/src/log';
import { Connection } from '../../web3-provider/Web3Provider';
import { sync } from '../Storage';

const STORAGE_SERVICE = '/storage';

function getAxiosConfig(token: string) {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}

export async function useDm3Storage(
    connection: Connection,
    userDb: UserDB,
    token: string,
): Promise<Acknoledgment[]> {
    const syncResult = await sync(userDb, token);
    log(`[dm3 Storage] Saving user storage`);

    const { account } = connection;
    const { profile, ensName } = account!;

    const url = `${STORAGE_SERVICE}/${normalizeEnsName(ensName)}`;

    await await getDeliveryServiceClient(
        profile!,
        connection.provider!,
        async (url) => (await axios.get(url)).data,
    ).post(url, syncResult.userStorage, getAxiosConfig(token));
    return syncResult.acknoledgments;
}

export async function getDm3Storage(
    connection: Connection,
    token: string,
): Promise<string | undefined> {
    log(`[dm3 Storage] Get user storage`);

    const { account } = connection;
    const { profile, ensName } = account!;

    const url = `${STORAGE_SERVICE}/${normalizeEnsName(ensName)}`;
    const { data } = await getDeliveryServiceClient(
        profile!,
        connection.provider!,
        async (url) => (await axios.get(url)).data,
    ).get(url, getAxiosConfig(token));

    return data;
}
