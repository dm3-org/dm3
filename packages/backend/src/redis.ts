import 'dotenv/config';
import { createClient } from 'redis';
import * as Lib from 'dm3-lib/dist.backend';
import { Express } from 'express';
import { stringify } from 'safe-stable-stringify';

const endpointUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export enum RedisPrefix {
    Conversation = 'conversation:',
    Sync = 'sync:',
    Session = 'session:',
    UserStorage = 'user.storage:',
    Pending = 'pending:',
}

export async function createRedisClient(app: Express) {
    const socketConf = {
        socket: {
            tls: true,
            rejectUnauthorized: false,
        },
    };
    /*     const client = createClient({
        url: endpointUrl,
        ...(process.env.NODE_ENV == 'development' ? {} : socketConf),
    }); */

    const client = createClient();
    client.on('error', (error) => {
        app.locals.logger.error({
            method: 'REDIS CLIENT',
            error,
        });
    });
    await client.connect();
    return client;
}

export async function getUserStorage(
    ensName: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<Lib.delivery.Session | null> {
    const userStorage = await redisClient.get(
        RedisPrefix.UserStorage + ensName,
    );
    return userStorage ? JSON.parse(userStorage) : null;
}

export async function setUserStorage(
    ensName: string,
    data: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<void> {
    await redisClient.set(RedisPrefix.UserStorage + ensName, stringify(data));
}

export async function addPending(
    ensName: string,
    contactEnsName: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<void> {
    await redisClient.sAdd(RedisPrefix.Pending + contactEnsName, ensName);
}

export async function getPending(
    ensName: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<string[]> {
    return redisClient.sMembers(RedisPrefix.Pending + ensName);
}

export async function deletePending(
    ensName: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<void> {
    await redisClient.del(RedisPrefix.Pending + ensName);
}
