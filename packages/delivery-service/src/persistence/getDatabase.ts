import { IGlobalNotification, IOtp } from '@dm3-org/dm3-lib-delivery';
import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import {
    ISessionDatabase,
    RedisPrefixShared,
    getIdEnsName,
    getRedisClient,
    getSession,
    setSession,
} from '@dm3-org/dm3-lib-server-side';
import {
    NotificationChannel,
    NotificationChannelType,
} from '@dm3-org/dm3-lib-shared';
import Messages from './messages';
import { syncAcknowledge } from './messages/syncAcknowledge';
import Notification from './notification';
import Otp from './otp';
import Pending from './pending';

export enum RedisPrefixDeliveryService {
    NotificationChannel = 'notificationChannel:',
    GlobalNotification = 'globalNotification:',
}

export const RedisPrefix = {
    ...RedisPrefixDeliveryService,
    ...RedisPrefixShared,
} as const;

export type RedisPrefix = typeof RedisPrefix;

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
        setSession: setSession(redis),
        getSession: getSession(redis),
        //Pending
        addPending: Pending.addPending(redis),
        getPending: Pending.getPending(redis),
        deletePending: Pending.deletePending(redis),
        getIdEnsName: getIdEnsName(redis),
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
        createdAt?: number,
    ) => Promise<void>;
    deleteExpiredMessages: (time: number) => Promise<void>;
    addPending: (ensName: string, contactEnsName: string) => Promise<void>;
    getPending: (ensName: string) => Promise<string[]>;
    deletePending: (ensName: string) => Promise<void>;
    getIdEnsName: (ensName: string) => Promise<string>;
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
}

export type Redis = Awaited<ReturnType<typeof getRedisClient>>;
