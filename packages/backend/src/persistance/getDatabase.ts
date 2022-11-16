import * as Lib from 'dm3-lib/dist.backend';
import { createClient } from 'redis';
import { createRedisClient } from '../redis';
import Messages from './messages';

export async function getRedisClient() {
    const client = createClient();

    client.on('error', (err) => {
        throw Error('REDIS CONNECTION ERROR ,', err);
    });

    await client.connect();

    return client;
}

export async function getDatabase(): Promise<IDatabase> {
    const redis = await getRedisClient();

    return {
        getMessages: Messages.getMessages(redis),
        createMessage: Messages.createMessage(redis),
        deleteExpiredMessages: Messages.deleteExpiredMessages(redis),
    };
}

export async function clearDatabase() {
    const db = await getRedisClient();
    await db.flushDb();
}

export async function disconnectDatabase() {
    const db = await getRedisClient();
    await db.disconnect();
}

//This has to be moved to the common package
export interface IDatabase {
    getMessages: (
        conversionId: string,
        from: number,
        to: number,
    ) => Promise<Lib.messaging.EncryptionEnvelop[]>;
    createMessage: (
        conversationId: string,
        envelop: Lib.messaging.EncryptionEnvelop,
    ) => Promise<void>;
    deleteExpiredMessages: (time: number) => Promise<void>;
}

export type Redis = Awaited<ReturnType<typeof createRedisClient>>;
