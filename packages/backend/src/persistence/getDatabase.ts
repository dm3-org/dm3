import { Session as DSSession, spamFilter } from '@dm3-org/dm3-lib-delivery';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import Pending from './pending';
import Session from './session';
import Storage from './storage';
import { MessageRecord } from './storage/postgres/utils/MessageRecord';

export enum RedisPrefix {
    Conversation = 'conversation:',
    IncomingConversations = 'incoming.conversations:',
    Sync = 'sync:',
    Session = 'session:',
    UserStorage = 'user.storage:',
    Pending = 'pending:',
    NotificationChannel = 'notificationChannel:',
    GlobalNotification = 'globalNotification:',
    Otp = 'otp:',
    UserStorageMigrated = 'user.storage.migrated:',
}

export async function getRedisClient() {
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
        global.logger.error('Redis error: ' + (err as Error).message);
    });

    client.on('reconnecting', () => global.logger.info('Redis reconnection'));
    client.on('ready', () => global.logger.info('Redis ready'));

    await client.connect();

    return client;
}

export async function getPrismaClient() {
    return new PrismaClient();
}

export async function getDatabase(
    _redis?: Redis,
    _prisma?: PrismaClient,
): Promise<IDatabase> {
    const redis = _redis ?? (await getRedisClient());
    const prisma = _prisma ?? (await getPrismaClient());

    return {
        //Session
        setSession: Session.setSession(redis),
        getSession: Session.getSession(redis),

        //Pending
        addPending: Pending.addPending(redis),
        getPending: Pending.getPending(redis),
        deletePending: Pending.deletePending(redis),
        //Storage AddConversation
        addConversation: Storage.addConversation(prisma),
        getConversationList: Storage.getConversationList(prisma),
        //Storage Add Messages
        addMessageBatch: Storage.addMessageBatch(prisma),
        //Storage Get Messages
        getMessagesFromStorage: Storage.getMessages(prisma),
        //Storage Edit Message Batch
        editMessageBatch: Storage.editMessageBatch(prisma),
        //Storage Get Number Of Messages
        getNumberOfMessages: Storage.getNumberOfMessages(prisma),
        //Storage Get Number Of Converations
        getNumberOfConverations: Storage.getNumberOfConversations(prisma),
        //Storage Toggle Hide Conversation
        toggleHideConversation: Storage.toggleHideConversation(prisma),
    };
}

export interface IDatabase {
    setSession: (ensName: string, session: DSSession) => Promise<void>;
    getSession: (ensName: string) => Promise<
        | (DSSession & {
              spamFilterRules: spamFilter.SpamFilterRules;
          })
        | null
    >;
    addPending: (ensName: string, contactEnsName: string) => Promise<void>;
    getPending: (ensName: string) => Promise<string[]>;
    deletePending: (ensName: string) => Promise<void>;

    addConversation: (
        ensName: string,
        encryptedContactName: string,
    ) => Promise<boolean>;
    getConversationList: (ensName: string) => Promise<string[]>;
    addMessageBatch: (
        ensName: string,
        encryptedContactName: string,
        messageBatch: MessageRecord[],
    ) => Promise<boolean>;
    getMessagesFromStorage: (
        ensName: string,
        encryptedContactName: string,
        page: number,
    ) => Promise<string[]>;
    editMessageBatch: (
        ensName: string,
        encryptedContactName: string,
        messageBatch: MessageRecord[],
    ) => Promise<void>;
    getNumberOfMessages: (
        ensName: string,
        encryptedContactName: string,
    ) => Promise<number>;
    getNumberOfConverations: (ensName: string) => Promise<number>;
    toggleHideConversation: (
        ensName: string,
        encryptedContactName: string,
        isHidden: boolean,
    ) => Promise<boolean>;
}

export type Redis = Awaited<ReturnType<typeof getRedisClient>>;
