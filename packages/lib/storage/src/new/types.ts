import { Envelop, MessageState } from '@dm3-org/dm3-lib-messaging';

export const INITIAL_ACCOUNT_MANIFEST = (key: string): AccountManifest => ({
    conversationListCounter: 0,
    key,
});
export const INITIAL_CONVERSATION_MANIFEST = (
    key: string,
): ConversationManifest => ({
    isHidden: false,
    messageCounter: 0,
    key,
});

export interface Conversation extends ConversationManifest {
    contactEnsName: string;
}

export interface StorageAPI {
    getConversationList: (page: number) => Promise<Conversation[]>;
    getMessages: (
        contactEnsName: string,
        page: number,
    ) => Promise<StorageEnvelopContainer[]>;
    getNumberOfMessages: (contactEnsName: string) => Promise<number>;
    getNumberOfConverations: () => Promise<number>;
    addConversation: (contactEnsName: string) => Promise<void>;
    addMessage: (
        contactEnsName: string,
        envelop: StorageEnvelopContainer,
    ) => Promise<void>;
    toggleHideConversation: (
        contactEnsName: string,
        isHidden: boolean,
    ) => Promise<void>;
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
    isHidden: boolean;
}

export interface MessageChunk extends Chunk {
    envelopContainer: StorageEnvelopContainer[];
}

export type RemoteFetchCb = <T extends Chunk>(
    key: string,
    value: T,
) => Promise<void>;

export interface StorageEnvelopContainer {
    messageState: MessageState;
    envelop: Envelop;
}
