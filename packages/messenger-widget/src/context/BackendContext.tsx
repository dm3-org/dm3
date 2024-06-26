import React from 'react';
import { useDeliveryService } from '../hooks/server-side/useDeliveryService';
import { useBackend } from '../hooks/server-side/useBackend';

export type BackendContextType = {
    isInitialized: boolean;
    addConversation: (ensName: string, encryptedContactName: string) => void;
    getConversations: (
        ensName: string,
        size: number,
        offset: number,
    ) => Promise<string[]>;
    toggleHideConversation: (
        ensName: string,
        encryptedContactName: string,
        hide: boolean,
    ) => void;
    getMessagesFromStorage: (
        ensName: string,
        encryptedContactName: string,
        pageNumber: number,
    ) => Promise<string[]>;
    addMessage: (
        ensName: string,
        encryptedContactName: string,
        messageId: string,
        encryptedEnvelopContainer: string,
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
