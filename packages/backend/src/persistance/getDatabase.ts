import * as Lib from 'dm3-lib/dist.backend';
import { createClient } from 'redis';
import { createRedisClient } from '../redis';
import Messages from './messages';
import Session from './session';
import Storage from './storage';
import Pending from './pending';

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
        //Session
        setSession: Session.setSession(redis),
        getSession: Session.getSession(redis),
        //Storage
        getUserStorage: Storage.getUserStorage(redis),
        setUserStorage: Storage.setUserStorage(redis),
        //Pending
        addPending: Pending.addPending(redis),
        getPending: Pending.getPending(redis),
        deletePending: Pending.deletePending(redis),
    };
}

export interface IDatabase {
    getMessages: (
        conversionId: string,
        offset: number,
        limit: number,
    ) => Promise<Lib.messaging.EncryptionEnvelop[]>;
    createMessage: (
        conversationId: string,
        envelop: Lib.messaging.EncryptionEnvelop,
        createdAt?: number,
    ) => Promise<void>;
    deleteExpiredMessages: (time: number) => Promise<void>;

    setSession: (
        account: string,
        session: Lib.delivery.Session,
    ) => Promise<void>;

    getSession: (account: string) => Promise<Lib.delivery.Session | null>;
    getUserStorage: (
        accountAddress: string,
    ) => Promise<Lib.storage.UserStorage | null>;
    setUserStorage: (accountAddress: string, data: string) => Promise<void>;
    addPending: (
        accountAddress: string,
        contactAddress: string,
    ) => Promise<void>;
    getPending: (accountAddress: string) => Promise<string[]>;
    deletePending: (accountAddress: string) => Promise<void>;
}

export type Redis = Awaited<ReturnType<typeof createRedisClient>>;
