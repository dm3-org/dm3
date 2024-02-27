import {
    Session as DSSession,
    IGlobalNotification,
    IOtp,
    NotificationChannel,
    NotificationChannelType,
    spamFilter,
} from '@dm3-org/dm3-lib-delivery';
import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import { UserStorage } from '@dm3-org/dm3-lib-storage';
import { createClient } from 'redis';
import { getAliasChain, getIdEnsName } from './getIdEnsName';
import Messages from './messages';
import Notification from './notification';
import Pending from './pending';
import Session from './session';
import Storage from './storage';
import Otp from './otp';
import { syncAcknowledge } from './messages/syncAcknowledge';
import { PrismaClient } from '@prisma/client';
import { addConversation } from './storage/postgres/addConversation';
import { getConversationList } from './storage/postgres/getConversationList';
import { getMessages } from './storage/postgres/getMessages';
import {
    MessageBatch,
    editMessageBatch,
} from './storage/postgres/editMessageBatch';
import { getNumberOfMessages } from './storage/postgres/getNumberOfMessages';
import { getNumberOfConversations } from './storage/postgres/getNumberOfConversations';
import { addMessageBatch } from './storage/postgres/addMessageBatch';
import { toggleHideConversation } from './storage/postgres/toggleHideConversation';

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
}

export async function getRedisClient() {
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
        //Messages
        getIncomingMessages: Messages.getIncomingMessages(redis),
        getMessages: Messages.getMessages(redis),
        createMessage: Messages.createMessage(redis),
        deleteExpiredMessages: Messages.deleteExpiredMessages(redis),
        //Session
        setSession: Session.setSession(redis),
        setAliasSession: Session.setAliasSession(redis),
        getSession: Session.getSession(redis),
        //Storage
        getUserStorageChunk: Storage.getUserStorageChunk(redis),
        setUserStorageChunk: Storage.setUserStorageChunk(redis),
        //Legacy remove after storage has been merged
        getUserStorage: Storage.getUserStorageOld(redis),
        setUserStorage: Storage.setUserStorageOld(redis),

        //Pending
        addPending: Pending.addPending(redis),
        getPending: Pending.getPending(redis),
        deletePending: Pending.deletePending(redis),
        getIdEnsName: getIdEnsName(redis),
        getAliasChain: getAliasChain(redis),
        syncAcknowledge: syncAcknowledge(redis),
        //Notification
        getUsersNotificationChannels:
            Notification.getUsersNotificationChannels(redis),
        addUsersNotificationChannel:
            Notification.addUsersNotificationChannel(redis),
        setNotificationChannelAsVerified:
            Notification.setNotificationChannelAsVerified(redis),
        enableOrDisableNotificationChannel:
            Notification.enableOrDisableNotificationChannel(redis),
        removeNotificationChannel:
            Notification.removeNotificationChannel(redis),
        // Global Notification
        getGlobalNotification: Notification.getGlobalNotification(redis),
        setGlobalNotification: Notification.setGlobalNotification(redis),
        // Verification Otp for Email, Mobile, etc..
        setOtp: Otp.setOtp(redis),
        getOtp: Otp.getOtp(redis),
        resetOtp: Otp.resetOtp(redis),
        //Storage AddConversation
        storage_addConversation: addConversation(prisma),
        storage_getConversationList: getConversationList(prisma),
        //Storage Add Messages
        storage_addMessageBatch: addMessageBatch(prisma),
        //Storage Get Messages
        storage_getMessages: getMessages(prisma),
        //Storage Edit Message Batch
        storage_editMesageBatch: editMessageBatch(prisma),
        //Storage Get Number Of Messages
        storage_getNumberOfMessages: getNumberOfMessages(prisma),
        //Storage Get Number Of Converations
        storage_getNumberOfConverations: getNumberOfConversations(prisma),
        //Storage Toggle Hide Conversation
        storage_toggleHideConversation: toggleHideConversation(prisma),
    };
}

export interface IDatabase {
    getIncomingMessages: (
        ensName: string,
        limit: number,
    ) => Promise<EncryptionEnvelop[]>;
    getMessages: (
        conversionId: string,
        offset: number,
        limit: number,
    ) => Promise<EncryptionEnvelop[]>;
    createMessage: (
        conversationId: string,
        envelop: EncryptionEnvelop,
        createdAt?: number,
    ) => Promise<void>;
    deleteExpiredMessages: (time: number) => Promise<void>;

    setSession: (ensName: string, session: DSSession) => Promise<void>;

    getSession: (ensName: string) => Promise<
        | (DSSession & {
              spamFilterRules: spamFilter.SpamFilterRules;
          })
        | null
    >;

    getUserStorageChunk: (
        ensName: string,
        key: string,
    ) => Promise<UserStorage | null>;
    setUserStorageChunk: (
        ensName: string,
        key: string,
        data: string,
    ) => Promise<void>;
    //Legacy remove after storage has been merged
    getUserStorage: (ensName: string) => Promise<UserStorage | null>;
    setUserStorage: (ensName: string, data: string) => Promise<void>;
    setAliasSession: (ensName: string, aliasEnsName: string) => Promise<void>;
    addPending: (ensName: string, contactEnsName: string) => Promise<void>;
    getPending: (ensName: string) => Promise<string[]>;
    deletePending: (ensName: string) => Promise<void>;
    getIdEnsName: (ensName: string) => Promise<string>;
    getAliasChain: (ensName: string) => Promise<string[]>;
    syncAcknowledge: (
        conversationId: string,
        syncTime: number,
    ) => Promise<void>;
    getUsersNotificationChannels: (
        ensName: string,
    ) => Promise<NotificationChannel[]>;
    addUsersNotificationChannel: (
        ensName: string,
        channel: NotificationChannel,
    ) => Promise<void>;
    setNotificationChannelAsVerified: (
        ensName: string,
        channel: NotificationChannelType,
    ) => Promise<void>;
    enableOrDisableNotificationChannel: (
        ensName: string,
        channel: NotificationChannelType,
        isEnabled: boolean,
    ) => Promise<void>;
    removeNotificationChannel: (
        ensName: string,
        channel: NotificationChannelType,
    ) => Promise<void>;
    getGlobalNotification: (ensName: string) => Promise<IGlobalNotification>;
    setGlobalNotification: (
        ensName: string,
        isEnabled: boolean,
    ) => Promise<void>;
    setOtp: (
        ensName: string,
        otp: string,
        channelType: NotificationChannelType,
        generatedAt: Date,
    ) => Promise<void>;
    getOtp: (
        ensName: string,
        channelType: NotificationChannelType,
    ) => Promise<IOtp | null>;
    resetOtp: (
        ensName: string,
        channelType: NotificationChannelType,
    ) => Promise<void>;

    storage_addConversation: (
        ensName: string,
        encryptedContactName: string,
    ) => Promise<boolean>;
    storage_getConversationList: (ensName: string) => Promise<string[]>;
    storage_addMessageBatch: (
        ensName: string,
        encryptedContactName: string,
        messageBatch: MessageBatch[],
    ) => Promise<boolean>;
    storage_getMessages: (
        ensName: string,
        encryptedContactName: string,
        page: number,
    ) => Promise<string[]>;
    storage_editMesageBatch: (
        ensName: string,
        encryptedContactName: string,
        messageBatch: MessageBatch[],
    ) => Promise<void>;
    storage_getNumberOfMessages: (
        ensName: string,
        encryptedContactName: string,
    ) => Promise<number>;
    storage_getNumberOfConverations: (ensName: string) => Promise<number>;
    storage_toggleHideConversation: (
        ensName: string,
        encryptedContactName: string,
        isHidden: boolean,
    ) => Promise<boolean>;
}

export type Redis = Awaited<ReturnType<typeof getRedisClient>>;
