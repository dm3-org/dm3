import axios from 'axios';
import { UserDB } from '.';
import { Connection } from '../web3-provider/Web3Provider';
import { sync, UserStorage } from './Storage';
import { log } from '../shared/log';
import { Acknoledgment } from '../delivery';
import { getDeliveryServiceProfile } from '../delivery/Delivery';

const STORAGE_SERVICE = '/storage';

function getAxiosConfig(token: string) {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}

export async function useDm3Storage(
    { account }: Connection,
    userDb: UserDB,
): Promise<Acknoledgment[]> {
    const syncResult = sync(userDb);
    log(`[dm3 Storage] Saving user storage`);

    const { profile, address } = account!;
    const deliveryServiceUrl = await getDeliveryServiceProfile(profile!);
    const url = `${deliveryServiceUrl}${STORAGE_SERVICE}/${address}`;

    await axios.post(
        url,
        syncResult.userStorage,
        getAxiosConfig(userDb.deliveryServiceToken),
    );
    return syncResult.acknoledgments;
}

export async function getDm3Storage(
    { account }: Connection,
    token: string,
): Promise<string | undefined> {
    log(`[dm3 Storage] Get user storage`);

    const { profile, address } = account!;
    const deliveryServiceUrl = await getDeliveryServiceProfile(profile!);
    const url = `${deliveryServiceUrl}${STORAGE_SERVICE}/${address}`;
    const { data } = await axios.get(url, getAxiosConfig(token));

    return data;
}
