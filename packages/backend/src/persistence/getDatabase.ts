import { Session as DSSession, spamFilter } from '@dm3-org/dm3-lib-delivery';
import {
    ISessionDatabase,
    RedisPrefixShared,
    Redis,
    getRedisClient,
    getSession,
    setSession,
} from '@dm3-org/dm3-lib-server-side';
//import { RedisPrefixShared } from '@dm3-org/dm3-lib-server-side/src/persistence/getDatabase';
import { UserStorage } from '@dm3-org/dm3-lib-storage';
import { PrismaClient } from '@prisma/client';
import Storage from './storage';
import { MessageRecord } from './storage/postgres/dto/MessageRecord';
import { ConversationRecord } from './storage/postgres/dto/ConversationRecord';

enum RedisPrefixBackend {
    Conversation = 'conversation:',
    IncomingConversations = 'incoming.conversations:',
    Sync = 'sync:',
    UserStorage = 'user.storage:',
    Otp = 'otp:',
    UserStorageMigrated = 'user.storage.migrated:',
}

const RedisPrefix = {
    ...RedisPrefixBackend,
    ...RedisPrefixShared,
} as const;

export type RedisPrefix = typeof RedisPrefix;

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
        setSession: setSession(redis),
        getSession: getSession(redis),
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
        //Get the user db migration status
        getUserDbMigrationStatus: Storage.getUserDbMigrationStatus(redis),
        //Set the user db migration status to true
        setUserDbMigrated: Storage.setUserDbMigrated(redis),
    };
}

export interface IDatabase extends ISessionDatabase {
    setSession: (ensName: string, session: DSSession) => Promise<void>;
    getSession: (ensName: string) => Promise<
        | (DSSession & {
              spamFilterRules: spamFilter.SpamFilterRules;
          })
        | null
    >;
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
    getUserDbMigrationStatus: (ensName: string) => Promise<boolean>;
    setUserDbMigrated: (ensName: string) => Promise<void>;
}
