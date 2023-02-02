import { IDatabase } from './IDatabase';
import * as Profile from './profile';

export async function getDatabase(_redis?: Redis): Promise<IDatabase> {
    const redis = _redis ?? (await getRedisClient());

    return {
        getUserProfile: Profile.getUserProfile(redis),
        setUserProfile: Profile.setUserProfile(redis),
        getUserProfileByAddress: Profile.getUserProfileByAddress(redis),
        hasAddressProfile: Profile.hasAddressProfile(redis),
        getAddressByName: Profile.getAddressByName(redis),
        getNameByAddress: Profile.getNameByAddress(redis),
    };
}

export type Redis = Awaited<ReturnType<typeof createRedisClient>>;

import { createClient } from 'redis';

export async function getRedisClient() {
    const client = createClient();

    client.on('error', (err) => {
        throw Error('REDIS CONNECTION ERROR ,' + err);
    });

    await client.connect();

    return client;
}

async function createRedisClient() {
    const client = createClient();
    await client.connect();

    if (!client.isReady) {
        throw "Redis connection can't be established";
    }
    return client;
}
