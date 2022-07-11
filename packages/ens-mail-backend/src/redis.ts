import 'dotenv/config';
import { createClient } from 'redis';
import * as Lib from 'ens-mail-lib';

const endpointUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export enum RedisPrefix {
    Conversation = 'conversation:',
    Sync = 'sync:',
    Session = 'session:',
    UserStorage = 'user.storage:',
    Pending = 'pending:',
}

export async function createRedisClient() {
    const socketConf = {
        socket: {
            tls: true,
            rejectUnauthorized: false,
        },
    };
    const client = createClient({
        url: endpointUrl,
        ...(process.env.DEV_MODE === 'true' ? {} : socketConf),
    });
    await client.connect();
    return client;
}

export async function getSession(
    accountAddress: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<Lib.Delivery.Session | null> {
    const session = await redisClient.get(
        RedisPrefix.Session + Lib.formatAddress(accountAddress),
    );
    return session ? JSON.parse(session) : null;
}

export async function setSession(
    accountAddress: string,
    session: Lib.Delivery.Session,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<void> {
    await redisClient.set(
        RedisPrefix.Session + Lib.formatAddress(accountAddress),
        JSON.stringify(session),
    );
}

export async function getUserStorage(
    accountAddress: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<Lib.Delivery.Session | null> {
    const userStorage = await redisClient.get(
        RedisPrefix.UserStorage + Lib.formatAddress(accountAddress),
    );
    return userStorage ? JSON.parse(userStorage) : null;
}

export async function setUserStorage(
    accountAddress: string,
    data: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<void> {
    await redisClient.set(
        RedisPrefix.UserStorage + Lib.formatAddress(accountAddress),
        JSON.stringify(data),
    );
}

export async function addPending(
    accountAddress: string,
    contactAddress: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<void> {
    await redisClient.sAdd(
        RedisPrefix.Pending + Lib.formatAddress(contactAddress),
        Lib.formatAddress(accountAddress),
    );
}

export async function getPending(
    accountAddress: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<string[]> {
    return redisClient.sMembers(
        RedisPrefix.Pending + Lib.formatAddress(accountAddress),
    );
}

export async function deletePending(
    accountAddress: string,
    redisClient: Awaited<ReturnType<typeof createRedisClient>>,
): Promise<void> {
    await redisClient.del(
        RedisPrefix.Pending + Lib.formatAddress(accountAddress),
    );
}
