import { IDatabase } from './IDatabase';
import * as Profile from './profile';
import { createClient } from 'redis';
import winston from 'winston';

export async function getDatabase(
    logger: winston.Logger,
    _redis?: Redis,
): Promise<IDatabase> {
    const redis = _redis ?? (await getRedisClient(logger));

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

export async function getRedisClient(logger: winston.Logger) {
    const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    const socketConf = {
        socket: {
            tls: true,
            rejectUnauthorized: false,
        },
    };
    const client = createClient(
        process.env.NODE_ENV === 'production'
            ? {
                  url,
                  ...socketConf,
              }
            : {},
    );

    client.on('error', (err) => {
        logger.error('Redis error: ' + (err as Error).message);
    });

    client.on('reconnecting', () => logger.info('Redis reconnection'));
    client.on('ready', () => logger.info('Redis ready'));

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
