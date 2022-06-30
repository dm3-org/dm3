import axios from 'axios';
import { UserDB } from '.';
import { Connection } from '../web3-provider/Web3Provider';
import { sync, UserStorage } from './Storage';
import { log } from '../shared/log';
import { Acknoledgment } from '../delivery';

const STORAGE_SERVICE = '/storage';

function getAxiosConfig(token: string) {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}

export async function useEnsMailStorage(
    connection: Connection,
    userDb: UserDB,
): Promise<Acknoledgment[]> {
    const syncResult = sync(userDb);
    log(`[ENS Mail Storage] Saving user storage`);
    await axios.post(
        connection.account!.profile!.deliveryServiceUrl +
            STORAGE_SERVICE +
            `/${connection.account?.address}`,
        syncResult.userStorage,
        getAxiosConfig(userDb.deliveryServiceToken),
    );
    return syncResult.acknoledgments;
}

export async function getEnsMailStorage(
    connection: Connection,
    token: string,
): Promise<string | undefined> {
    log(`[ENS Mail Storage] Get user storage`);
    return (
        await axios.get(
            connection.account!.profile!.deliveryServiceUrl +
                STORAGE_SERVICE +
                `/${connection.account?.address}`,
            getAxiosConfig(token),
        )
    ).data;
}
