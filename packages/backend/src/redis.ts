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

export async function getSession(
    accountAddress: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<Lib.delivery.Session | null> {
    const session = await redisClient.get(
        RedisPrefix.Session + Lib.external.formatAddress(accountAddress),
    );
    return session ? JSON.parse(session) : null;
}

export async function setSession(
    accountAddress: string,
    session: Lib.delivery.Session,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<void> {
    await redisClient.set(
        RedisPrefix.Session + Lib.external.formatAddress(accountAddress),
        stringify(session),
    );
}

export async function getUserStorage(
    accountAddress: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<Lib.delivery.Session | null> {
    const userStorage = await redisClient.get(
        RedisPrefix.UserStorage + Lib.external.formatAddress(accountAddress),
    );
    return userStorage ? JSON.parse(userStorage) : null;
}

export async function setUserStorage(
    accountAddress: string,
    data: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<void> {
    await redisClient.set(
        RedisPrefix.UserStorage + Lib.external.formatAddress(accountAddress),
        stringify(data),
    );
}

export async function addPending(
    accountAddress: string,
    contactAddress: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<void> {
    await redisClient.sAdd(
        RedisPrefix.Pending + Lib.external.formatAddress(contactAddress),
        Lib.external.formatAddress(accountAddress),
    );
}

export async function getPending(
    accountAddress: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<string[]> {
    return redisClient.sMembers(
        RedisPrefix.Pending + Lib.external.formatAddress(accountAddress),
    );
}

export async function deletePending(
    accountAddress: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<void> {
    await redisClient.del(
        RedisPrefix.Pending + Lib.external.formatAddress(accountAddress),
    );
}
