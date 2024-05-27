import { StorageEnvelopContainer } from '@dm3-org/dm3-lib-storage';
import React, { useContext } from 'react';
import {
    AddConversation,
    GetConversations,
    GetMessages,
    GetNumberOfMessages,
    StoreMessageAsync,
    StoreMessageBatch,
    ToggleHideContactAsync,
    editMessageBatchAsync,
    useStorage,
} from '../hooks/storage/useStorage';
import { AuthContext } from './AuthContext';
import { DeliveryServiceContext } from './DeliveryServiceContext';

export type StorageContextType = {
    storeMessage: StoreMessageAsync;
    storeMessageBatch: StoreMessageBatch;
    editMessageBatchAsync: editMessageBatchAsync;
    getConversations: GetConversations;
    addConversationAsync: AddConversation;
    getNumberOfMessages: GetNumberOfMessages;
    getMessages: GetMessages;
    toggleHideContactAsync: ToggleHideContactAsync;
    initialized: boolean;
};

export const StorageContext = React.createContext<StorageContextType>({
    storeMessage: async (
        contact: string,
        envelop: StorageEnvelopContainer,
    ) => {},
    storeMessageBatch: async (
        contact: string,
        batch: StorageEnvelopContainer[],
    ) => {},
    editMessageBatchAsync: async (
        contact: string,
        batch: StorageEnvelopContainer[],
    ) => {},
    getConversations: async (page: number) => Promise.resolve([]),
    addConversationAsync: (contact: string) => {},
    getMessages: async (contact: string, page: number) => Promise.resolve([]),
    getNumberOfMessages: async (contact: string) => Promise.resolve(0),
    toggleHideContactAsync: async (contact: string, value: boolean) => {},
    initialized: false,
});

export const StorageContextProvider = ({ children }: { children?: any }) => {
    const { account, profileKeys } = useContext(AuthContext);
    const { getDeliveryServiceTokens } = useContext(DeliveryServiceContext);

    const {
        storeMessageAsync,
        storeMessageBatch,
        editMessageBatchAsync,
        getConversations,
        addConversationAsync,
        getNumberOfMessages,
        getMessages,
        toggleHideContactAsync,
        initialized,
    } = useStorage(
        account,
        process.env.REACT_APP_DEFAULT_SERVICE!,
        getDeliveryServiceTokens()[0],
        profileKeys,
    );
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
                toggleHideContactAsync,
                initialized,
            }}
        >
            {children}
        </StorageContext.Provider>
    );
};
