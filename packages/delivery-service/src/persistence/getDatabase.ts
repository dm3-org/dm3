import { IGlobalNotification, IOtp } from '@dm3-org/dm3-lib-delivery';
import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import {
    NotificationChannel,
    NotificationChannelType,
} from '@dm3-org/dm3-lib-shared';
// import { PrismaClient } from '@prisma/client';
import { ISessionDatabase } from '@dm3-org/dm3-lib-server-side';
import { createClient } from 'redis';
import { getIdEnsName } from './getIdEnsName';
import Messages from './messages';
import { syncAcknowledge } from './messages/syncAcknowledge';
import Notification from './notification';
import Otp from './otp';
import Session from './session';

export enum RedisPrefix {
    Conversation = 'conversation:',
    IncomingConversations = 'incoming.conversations:',
    Sync = 'sync:',
    Session = 'session:',
    UserStorage = 'user.storage:',
    NotificationChannel = 'notificationChannel:',
    GlobalNotification = 'globalNotification:',
    Otp = 'otp:',
    UserStorageMigrated = 'user.storage.migrated:',
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

export async function getDatabase(
    _redis?: Redis,
    // _prisma?: PrismaClient,
): Promise<IDatabase> {
    const redis = _redis ?? (await getRedisClient());
    // const prisma = _prisma ?? (await getPrismaClient());

    return {
        //Messages
        getIncomingMessages: Messages.getIncomingMessages(redis),
        getMessages: Messages.getMessages(redis),
        createMessage: Messages.createMessage(redis),
        deleteExpiredMessages: Messages.deleteExpiredMessages(redis),
        //Session
        setSession: Session.setSession(redis),
        getSession: Session.getSession(redis),
        getIdEnsName: getIdEnsName(redis),
        //Sync
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
    };
}

export interface IDatabase extends ISessionDatabase {
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
    ) => Promise<void>;
    deleteExpiredMessages: (time: number) => Promise<void>;
    getIdEnsName: (ensName: string) => Promise<string>;
    syncAcknowledge: (
        conversationId: string,
        messageHash: string,
    ) => Promise<boolean>;
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
}

export type Redis = Awaited<ReturnType<typeof getRedisClient>>;
