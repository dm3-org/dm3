import { Message } from 'dm3-lib-messaging';
import { RedisClientType, createClient } from 'redis';
import winston from 'winston';
import { createMessage } from './createMessage/createMessage';

export enum RedisPrefix {
    Messages = 'messages:',
}

export async function getRedisClient(logger: winston.Logger) {
    const url = process.env.REDIS_URL || 'redis://127.0.0.1:6368';
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

    client.on('ready', () => {
        () => logger.info('Redis ready');
    });
    await client.connect();
    return client;
}

export async function getDatabase(
    logger: winston.Logger,
    _redis?: Redis,
): Promise<IDatabase> {
    const redis = _redis ?? (await getRedisClient(logger));
    return {
        createMessage: createMessage(redis),
    };
}

export interface IDatabase {
    createMessage: (idBillboard: string, message: Message) => Promise<void>;
}

export type Redis = Awaited<ReturnType<typeof getRedisClient>>;
