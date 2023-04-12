import * as Lib from 'dm3-lib/dist.backend';
import { createClient } from 'redis';
import Messages from './messages';
import Session from './session';
import Storage from './storage';
import Pending from './pending';
import { getIdEnsName } from './session/getIdEnsName';
import winston from 'winston';
import { syncAcknoledgment } from './messages/syncAcknoledgment';

export enum RedisPrefix {
    Conversation = 'conversation:',
    Sync = 'sync:',
    Session = 'session:',
    UserStorage = 'user.storage:',
    Pending = 'pending:',
}

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

export async function getDatabase(
    logger: winston.Logger,
    _redis?: Redis,
): Promise<IDatabase> {
    const redis = _redis ?? (await getRedisClient(logger));

    return {
        getMessages: Messages.getMessages(redis),
        createMessage: Messages.createMessage(redis),
        deleteExpiredMessages: Messages.deleteExpiredMessages(redis),
        //Session
        setSession: Session.setSession(redis),
        setAliasSession: Session.setAliasSession(redis),
        getSession: Session.getSession(redis),
        //Storage
        getUserStorage: Storage.getUserStorage(redis),
        setUserStorage: Storage.setUserStorage(redis),
        //Pending
        addPending: Pending.addPending(redis),
        getPending: Pending.getPending(redis),
        deletePending: Pending.deletePending(redis),
        getIdEnsName: getIdEnsName(redis),
        syncAcknoledgment: syncAcknoledgment(redis),
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
        ensName: string,
        session: Lib.delivery.Session,
    ) => Promise<void>;

    getSession: (ensName: string) => Promise<
        | (Lib.delivery.Session & {
              spamFilterRules: Lib.delivery.spamFilter.SpamFilterRules;
          })
        | null
    >;

    getUserStorage: (
        ensName: string,
    ) => Promise<Lib.storage.UserStorage | null>;
    setUserStorage: (ensName: string, data: string) => Promise<void>;
    setAliasSession: (ensName: string, aliasEnsName: string) => Promise<void>;
    addPending: (ensName: string, contactEnsName: string) => Promise<void>;
    getPending: (ensName: string) => Promise<string[]>;
    deletePending: (ensName: string) => Promise<void>;
    getIdEnsName: (ensName: string) => Promise<string>;
    syncAcknoledgment: (
        conversationId: string,
        ensName: string,
        lastMessagePull: string,
    ) => Promise<void>;
}

export type Redis = Awaited<ReturnType<typeof getRedisClient>>;
