import React from 'react';
import { useBackend } from '../hooks/server-side/useBackend';
import { MessageRecord } from '@dm3-org/dm3-lib-storage';

export type BackendContextType = {
    isInitialized: boolean;
    addConversation: (
        ensName: string,
        encryptedContactName: string,
        encryptedContactTLDName: string,
    ) => void;
    getConversations: (
        ensName: string,
        size: number,
        offset: number,
    ) => Promise<
        {
            contact: string;
            encryptedContactTLDName: string;
            previewMessage: string;
            updatedAt: Date;
        }[]
    >;
    toggleHideConversation: (
        ensName: string,
        encryptedContactName: string,
        hide: boolean,
    ) => void;
    getMessagesFromStorage: (
        ensName: string,
        encryptedContactName: string,
        pageSize: number,
        offset: number,
    ) => Promise<string[]>;
    getHaltedMessages: (ensName: string) => Promise<MessageRecord[]>;
    clearHaltedMessages: (
        ensName: string,
        aliasName: string,
        messageId: string,
    ) => Promise<void>;
    addMessage: (
        ensName: string,
        encryptedContactName: string,
        messageId: string,
        createdAt: number,
        encryptedEnvelopContainer: string,
        isHalted: boolean,
    ) => Promise<void>;
    addMessageBatch: (
        ensName: string,
        encryptedContactName: string,
        messages: string[],
    ) => void;
    editMessageBatch: (
        ensName: string,
        encryptedContactName: string,
        messages: string[],
    ) => void;
    getNumberOfMessages: (
        ensName: string,
        encryptedContactName: string,
    ) => Promise<number>;
    getNumberOfConversations: (ensName: string) => Promise<number>;
};

export const BackendContext = React.createContext<BackendContextType>({
    isInitialized: false,
    addConversation: () => {},
    getConversations: async () => [],
    toggleHideConversation: () => {},
    getMessagesFromStorage: async () => [],
    getHaltedMessages: async (ensName: string) => [],
    clearHaltedMessages: async () => {},
    addMessage: async () => {},
    addMessageBatch: () => {},
    editMessageBatch: () => {},
    getNumberOfMessages: async () => 0,
    getNumberOfConversations: async () => 0,
});

export const BackendContextProvider = ({ children }: { children?: any }) => {
    const {
        isInitialized,
        addConversation,
        getConversations,
        toggleHideConversation,
        getMessagesFromStorage,
        getHaltedMessages,
        clearHaltedMessages,
        addMessage,
        addMessageBatch,
        editMessageBatch,
        getNumberOfMessages,
        getNumberOfConversations,
    } = useBackend();

    return (
        <BackendContext.Provider
            value={{
                isInitialized,
                addConversation,
                getConversations,
                toggleHideConversation,
                getMessagesFromStorage,
                getHaltedMessages,
                clearHaltedMessages,
                addMessage,
                addMessageBatch,
                editMessageBatch,
                getNumberOfMessages,
                getNumberOfConversations,
            }}
        >
            {children}
        </BackendContext.Provider>
    );
};
