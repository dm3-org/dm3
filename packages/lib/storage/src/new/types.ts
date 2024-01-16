import { Envelop } from '@dm3-org/dm3-lib-messaging';

export interface StorageAPI {
    getMessages: (
        contactEnsName: string,
        page: number,
    ) => Promise<MessageChunk | undefined>;
    getNumberOfMessages: (contactEnsName: string) => Promise<number>;
    getNumberOfConverations: () => Promise<number>;
    getConversationList: (
        page: number,
    ) => Promise<ConversationList | undefined>;
    addConversation: (contactEnsName: string) => Promise<void>;
    addMessage: (contactEnsName: string, envelop: Envelop) => Promise<void>;
}

export enum ReadStrategy {
    RemoteFirst = 'RemoteFirst',
    LocalFirst = 'LocalFirst',
}

export type Read = <T extends Chunk>(key: string) => Promise<T | undefined>;
export type Write = <T extends Chunk>(key: string, value: T) => Promise<void>;

export type KeyValueStore = {
    read: Read;
    write: Write;
};
export type Encryption = {
    encrypt: (data: string) => Promise<string>;
    decrypt: (data: string) => Promise<string>;
};

export type Db = {
    accountEnsName: string;
    sign: (data: string) => Promise<string>;
    encryption: Encryption;
    readStrategy: ReadStrategy;
    keyValueStoreLocal: KeyValueStore;
    keyValueStoreRemote?: KeyValueStore;
    updateLocalStorageOnRemoteRead: <T extends Chunk>(
        key: string,
        value: T,
    ) => Promise<void>;
};

export interface Chunk {
    key: string;
}

export interface AccountManifest extends Chunk {
    conversationListCounter: number;
}

export interface ConversationList extends Chunk {
    conversationList: string[];
}

export interface ConversationManifest extends Chunk {
    messageCounter: number;
}

export interface MessageChunk extends Chunk {
    envelops: Envelop[];
}

export type RemoteFetchCb = <T extends Chunk>(
    key: string,
    value: T,
) => Promise<void>;
