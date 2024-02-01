import { Envelop } from '@dm3-org/dm3-lib-messaging';
import React, { useContext } from 'react';
import {
    AddConversation,
    GetConversations,
    GetMessages,
    GetNumberOfMessages,
    StoreMessageAsync,
    ToggleHideContactAsync,
    useStorage,
} from '../hooks/storage/useStorage';
import { AuthContext } from './AuthContext';

export type StorageContextType = {
    storeMessage: StoreMessageAsync;
    getConversations: GetConversations;
    addConversationAsync: AddConversation;
    getNumberOfMessages: GetNumberOfMessages;
    getMessages: GetMessages;
    toggleHideContactAsync: ToggleHideContactAsync;
    initialized: boolean;
};

export const StorageContext = React.createContext<StorageContextType>({
    storeMessage: async (msg: Envelop) => {},
    getConversations: async (page: number) => Promise.resolve([]),
    addConversationAsync: (contact: string) => {},
    getMessages: async (contact: string, page: number) => Promise.resolve([]),
    getNumberOfMessages: async (contact: string) => Promise.resolve(0),
    toggleHideContactAsync: async (contact: string, value: boolean) => {},
    initialized: false,
});

export const StorageContextProvider = ({ children }: { children?: any }) => {
    const { account, deliveryServiceToken, profileKeys } =
        useContext(AuthContext);

    const {
        storeMessageAsync,
        getConversations,
        addConversationAsync,
        getNumberOfMessages,
        getMessages,
        toggleHideContactAsync,
        initialized,
    } = useStorage(account, deliveryServiceToken, profileKeys);
    return (
        <StorageContext.Provider
            value={{
                storeMessage: storeMessageAsync,
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
