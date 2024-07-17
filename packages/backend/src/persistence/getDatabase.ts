import { Session as DSSession, spamFilter } from '@dm3-org/dm3-lib-delivery';
import { IAccountDatabase } from '@dm3-org/dm3-lib-server-side';
import { UserStorage } from '@dm3-org/dm3-lib-storage';
import { Account, PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import Storage from './storage';
import { ConversationRecord } from './storage/postgres/dto/ConversationRecord';
import { MessageRecord } from './storage/postgres/dto/MessageRecord';

export enum RedisPrefix {
    Conversation = 'conversation:',
    IncomingConversations = 'incoming.conversations:',
    Sync = 'sync:',
    // Account used to be called Session. The prefix still resolves to "session:" for now.
    Account = 'session:',
    UserStorage = 'user.storage:',
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
        console.error('Redis error: ' + (err as Error).message);
    });

    client.on('reconnecting', () => console.info('Redis reconnection'));
    client.on('ready', () => console.info('Redis ready'));

    await client.connect();

    return client;
}

export async function getPrismaClient() {
    return new PrismaClient();
}

export async function getDatabase(
    _redis?: Redis,
    _prisma?: PrismaClient,
): Promise<IBackendDatabase> {
    const redis = _redis ?? (await getRedisClient());
    const prisma = _prisma ?? (await getPrismaClient());

    return {
        //Session
        setAccount: Storage.setAccount(prisma),
        getAccount: Storage.getAccount(prisma),
        doesAccountExist: Storage.doesAccountExist(prisma),
        //Legacy remove after storage has been merged
        getUserStorage: Storage.getUserStorageOld(redis),
        setUserStorage: Storage.setUserStorageOld(redis),
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
        //Storage Get Halted Messages
        getHaltedMessages: Storage.getHaltedMessages(prisma),
        //Storage Delete Halted Message
        clearHaltedMessage: Storage.clearHaltedMessage(prisma),
        //Get the user db migration status
        getUserDbMigrationStatus: Storage.getUserDbMigrationStatus(redis),
        //Set the user db migration status to true
        setUserDbMigrated: Storage.setUserDbMigrated(redis),
    };
}

export interface IBackendDatabase {
    setAccount: (ensName: string) => Promise<Account>;
    getAccount: (ensName: string) => Promise<Account | null>;
    doesAccountExist: (ensName: string) => Promise<boolean>;
    //Legacy remove after storage has been merged
    getUserStorage: (ensName: string) => Promise<UserStorage | null>;
    setUserStorage: (ensName: string, data: string) => Promise<void>;

    addConversation: (
        ensName: string,
        encryptedContactName: string,
    ) => Promise<boolean>;
    getConversationList: (
        ensName: string,
        size: number,
        offset: number,
    ) => Promise<ConversationRecord[]>;
    addMessageBatch: (
        ensName: string,
        encryptedContactName: string,
        messageBatch: MessageRecord[],
    ) => Promise<boolean>;
    getMessagesFromStorage: (
        ensName: string,
        encryptedContactName: string,
        size: number,
        offset: number,
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
    getHaltedMessages: (ensName: string) => Promise<MessageRecord[]>;
    clearHaltedMessage: (
        ensName: string,
        aliasName: string,
        messageId: string,
    ) => Promise<boolean>;
    getUserDbMigrationStatus: (ensName: string) => Promise<boolean>;
    setUserDbMigrated: (ensName: string) => Promise<void>;
}

export type Redis = Awaited<ReturnType<typeof getRedisClient>>;
