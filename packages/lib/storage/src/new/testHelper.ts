import { Envelop, Message } from 'dm3-lib-messaging';
import { sha256 } from 'dm3-lib-shared';
import {
    AccountManifest,
    Chunk,
    ConversationList,
    ConversationManifest,
    Db,
    MessageChunk,
    ReadStrategy,
} from './types';
import {
    getAccountManifestKey,
    getConversationListKey,
    getConversationManifestKey,
    getMessageChunkKey,
} from './keys';

export function makeEnvelop(
    from: string,
    to: string,
    msg: string,
    timestamp: number = 0,
) {
    const message: Message = {
        metadata: {
            to,
            from,
            timestamp,
            type: 'NEW',
        },
        message: msg,
        signature: '',
    };

    const envelop: Envelop = {
        message,
        metadata: {
            deliveryInformation: {
                from: '',
                to: '',
                deliveryInstruction: '',
            },
            encryptedMessageHash: '',
            version: '',
            encryptionScheme: '',
            signature: '',
        },
    };

    return envelop;
}

export const sign = async (data: string) => sha256(data);
export const testEnvelop = makeEnvelop('from1', 'to1', 'message', Date.now());
export const db: Db = {
    accountEnsName: 'test.dm3.eth',
    updateLocalStorageOnRemoteRead: async <T extends Chunk>(
        key: string,
        value: T,
    ) => {},
    keyValueStoreLocal: {
        read: async <T>(key: string) => {
            switch (key) {
                // AccountManifest
                case await getAccountManifestKey(db):
                    const accountManifest: AccountManifest = {
                        conversationListCounter: 101,
                        key,
                    };

                    return accountManifest as T;

                // ConversationList page 0
                case await getConversationListKey(db, 1):
                    const conversationList: ConversationList = {
                        conversationList: ['c1'],
                        key,
                    };
                    return conversationList as T;

                // ConversationManifest for test.dm3.eth and alice.eth
                case await getConversationManifestKey(db, 'alice.eth'):
                    const conversationManifest: ConversationManifest = {
                        key,
                        messageCounter: 101,
                    };
                    return conversationManifest as T;

                // MessageChunk page 1 for test.dm3.eth and alice.eth
                case await getMessageChunkKey(db, 'alice.eth', 1):
                    const messageChunk: MessageChunk = {
                        envelops: [testEnvelop],
                        key,
                    };
                    return messageChunk as T;

                default:
                    return undefined;
            }
        },
        write: async (key: string) => {},
    },
    sign,
    readStrategy: ReadStrategy.LocalFirst,
    encryption: {
        encrypt: async (data: string) => data,
        decrypt: async (data: string) => data,
    },
};
