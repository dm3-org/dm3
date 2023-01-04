import { IDatabase } from './IDatabase';

export async function getDatabase(_redis?: Redis): Promise<IDatabase> {
    const redis = _redis ?? (await getRedisClient());

    return {};
}

export type Redis = Awaited<ReturnType<typeof createRedisClient>>;

import { createClient } from 'redis';

async function getRedisClient() {
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
