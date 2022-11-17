import * as Lib from 'dm3-lib/dist.backend';
import { createClient } from 'redis';
import { createRedisClient } from '../redis';
import Messages from './messages';

export async function getRedisClient() {
    const client = createClient();

    client.on('error', (err) => {
        throw Error('REDIS CONNECTION ERROR ,' + err);
    });

    await client.connect();

    return client;
}

export async function getDatabase(_redis?: Redis): Promise<IDatabase> {
    const redis = _redis ?? (await getRedisClient());

    return {
        getMessages: Messages.getMessages(redis),
        createMessage: Messages.createMessage(redis),
        deleteExpiredMessages: Messages.deleteExpiredMessages(redis),
    };
}

//This has to be moved to the Lib package
export interface IDatabase {
    getMessages: (
        conversionId: string,
        from: number,
        to: number,
    ) => Promise<Lib.messaging.EncryptionEnvelop[]>;
    createMessage: (
        conversationId: string,
        envelop: Lib.messaging.EncryptionEnvelop,
        createdAt?: number,
    ) => Promise<void>;
    deleteExpiredMessages: (time: number) => Promise<void>;
}

export type Redis = Awaited<ReturnType<typeof createRedisClient>>;
