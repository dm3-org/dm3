import { Envelop, MessageState } from '@dm3-org/dm3-lib-messaging';

export interface StorageAPI {
    getConversations: (size: number, offset: number) => Promise<Conversation[]>;
    getMessages: (
        contactEnsName: string,
        pageSize: number,
        offset: number,
    ) => Promise<StorageEnvelopContainer[]>;
    getHaltedMessages: () => Promise<StorageEnvelopContainer[]>;
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
        ishalted: boolean,
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
    //the contactEnsName is the ensName of the contact
    contactEnsName: string;
    //the previewMessage is the last message of the conversation
    previewMessage?: StorageEnvelopContainer;
    //isHidden is a flag to hide the conversation from the conversation list
    isHidden: boolean;
}

export type Encryption = {
    encryptAsync: (data: string) => Promise<string>;
    decryptAsync: (data: string) => Promise<string>;
    encryptSync: (data: string) => Promise<string>;
    decryptSync: (data: string) => Promise<string>;
};
