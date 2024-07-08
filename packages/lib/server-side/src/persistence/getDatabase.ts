// import { Session as DSSession, spamFilter } from '@dm3-org/dm3-lib-delivery';
// import { ISessionDatabase } from '@dm3-org/dm3-lib-server-side';
// import { UserStorage } from '@dm3-org/dm3-lib-storage';
// import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
// import Session from './session';
// import Storage from './storage';
// import { MessageRecord } from './storage/postgres/dto/MessageRecord';
// import { ConversationRecord } from './storage/postgres/dto/ConversationRecord';

export enum RedisPrefixShared {
    Conversation = 'conversation:',
    IncomingConversations = 'incoming.conversations:',
    Sync = 'sync:',
    Session = 'session:',
    Otp = 'otp:',
}

export async function getRedisClient() {
    // todo: the default port is different for backend and delivery-service. How can we handle this?
    const url = process.env.REDIS_URL || 'redis://127.0.0.1:6380';
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
            : { url },
    );

    client.on('error', (err) => {
        console.error('Redis error: ' + (err as Error).message);
    });

    client.on('reconnecting', () => console.info('Redis reconnection'));
    client.on('ready', () => console.info('Redis ready'));

    await client.connect();

    return client;
}

export type Redis = Awaited<ReturnType<typeof getRedisClient>>;
