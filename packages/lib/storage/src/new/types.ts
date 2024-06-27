import { Envelop, MessageState } from '@dm3-org/dm3-lib-messaging';

export interface StorageAPI {
    getConversations: (size: number, offset: number) => Promise<Conversation[]>;
    getMessages: (
        contactEnsName: string,
        pageSize: number,
        offset: number,
    ) => Promise<StorageEnvelopContainer[]>;
    addMessageBatch: (
        contactEnsName: string,
        batch: StorageEnvelopContainer[],
    ) => Promise<string>;
    editMessageBatch: (
        contactEnsName: string,
        editedMessage: StorageEnvelopContainer[],
    ) => Promise<void>;
    getNumberOfMessages: (contactEnsName: string) => Promise<number>;
    getNumberOfConverations: () => Promise<number>;
    addConversation: (contactEnsName: string) => Promise<void>;
    addMessage: (
        contactEnsName: string,
        envelop: StorageEnvelopContainer,
    ) => Promise<string>;
    toggleHideConversation: (
        contactEnsName: string,
        isHidden: boolean,
    ) => Promise<void>;
}

export interface StorageEnvelopContainer {
    messageState: MessageState;
    envelop: Envelop;
}

export interface Conversation {
    contactEnsName: string;
    isHidden: boolean;
}

export type Encryption = {
    encryptAsync: (data: string) => Promise<string>;
    decryptAsync: (data: string) => Promise<string>;
    encryptSync: (data: string) => Promise<string>;
    decryptSync: (data: string) => Promise<string>;
};
