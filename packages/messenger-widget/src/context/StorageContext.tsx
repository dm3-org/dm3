import { StorageEnvelopContainer } from '@dm3-org/dm3-lib-storage';
import React, { useContext } from 'react';
import {
    AddConversation,
    ClearHaltedMessages,
    GetConversations,
    GetHaltedMessages,
    GetMessages,
    GetNumberOfMessages,
    StoreMessageAsync,
    StoreMessageBatch,
    ToggleHideContactAsync,
    editMessageBatchAsync,
    useStorage,
} from '../hooks/storage/useStorage';
import { AuthContext } from './AuthContext';
import { BackendContext } from './BackendContext';

export type StorageContextType = {
    storeMessage: StoreMessageAsync;
    storeMessageBatch: StoreMessageBatch;
    editMessageBatchAsync: editMessageBatchAsync;
    getConversations: GetConversations;
    addConversationAsync: AddConversation;
    getNumberOfMessages: GetNumberOfMessages;
    getMessages: GetMessages;
    getHaltedMessages: GetHaltedMessages;
    clearHaltedMessages: ClearHaltedMessages;
    toggleHideContactAsync: ToggleHideContactAsync;
    initialized: boolean;
};

export const StorageContext = React.createContext<StorageContextType>({
    storeMessage: async (
        contact: string,
        envelop: StorageEnvelopContainer,
        isHalted?: boolean,
    ) => {},
    storeMessageBatch: async (
        contact: string,
        batch: StorageEnvelopContainer[],
    ) => {},
    editMessageBatchAsync: async (
        contact: string,
        batch: StorageEnvelopContainer[],
    ) => {},
    getConversations: async (size: number, offset: number) =>
        Promise.resolve([]),
    addConversationAsync: (contact: string) => {},
    getMessages: async (contact: string, pageSize: number, offset: number) =>
        Promise.resolve([]),
    getHaltedMessages: async () => Promise.resolve([]),
    clearHaltedMessages: async (messageId: string, aliasName: string) =>
        Promise.resolve(),
    getNumberOfMessages: async (contact: string) => Promise.resolve(0),
    toggleHideContactAsync: async (contact: string, value: boolean) => {},
    initialized: false,
});

export const StorageContextProvider = ({ children }: { children?: any }) => {
    const { account, profileKeys } = useContext(AuthContext);
    const backendContext = useContext(BackendContext);

    const {
        storeMessageAsync,
        storeMessageBatch,
        editMessageBatchAsync,
        getConversations,
        addConversationAsync,
        getNumberOfMessages,
        getMessages,
        getHaltedMessages,
        clearHaltedMessages,
        toggleHideContactAsync,
        initialized,
    } = useStorage(account, backendContext, profileKeys);
    return (
        <StorageContext.Provider
            value={{
                storeMessage: storeMessageAsync,
                storeMessageBatch: storeMessageBatch,
                editMessageBatchAsync,
                getConversations,
                addConversationAsync,
                getNumberOfMessages,
                getMessages,
                getHaltedMessages,
                clearHaltedMessages,
                toggleHideContactAsync,
                initialized,
            }}
        >
            {children}
        </StorageContext.Provider>
    );
};
