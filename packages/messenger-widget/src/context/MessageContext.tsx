import React from 'react';

import {
    AddMessage,
    GetMessages,
    MessageStorage,
    useMessage,
} from '../hooks/messages/useMessage';

export type MessageContextType = {
    getMessages: GetMessages;
    getUnreadMessageCount: (contact: string) => number;
    addMessage: AddMessage;
    contactIsLoading: (contact: string) => boolean;
    messages: MessageStorage;
};

export const MessageContext = React.createContext<MessageContextType>({
    getMessages: (contact: string) => [],
    getUnreadMessageCount: (contact: string) => 0,
    addMessage: (contact: string, message: any) =>
        new Promise(() => {
            isSuccess: true;
        }),
    contactIsLoading: (contact: string) => false,
    messages: {},
});

export const MessageContextProvider = ({ children }: { children?: any }) => {
    const {
        addMessage,
        getMessages,
        getUnreadMessageCount,
        contactIsLoading,
        messages,
    } = useMessage();

    return (
        <MessageContext.Provider
            value={{
                addMessage,
                getMessages,
                getUnreadMessageCount,
                contactIsLoading,
                messages,
            }}
        >
            {children}
        </MessageContext.Provider>
    );
};
