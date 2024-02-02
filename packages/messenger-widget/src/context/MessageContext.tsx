import React from 'react';

import {
    AddMessage,
    GetMessages,
    useMessage,
} from '../hooks/messages/useMessage';

export type MessageContextType = {
    getMessages: GetMessages;
    addMessage: AddMessage;
};

export const MessageContext = React.createContext<MessageContextType>({
    getMessages: (contact: string) => [],
    addMessage: (contact: string, message: any) => {},
});

export const MessageContextProvider = ({ children }: { children?: any }) => {
    const { addMessage, getMessages } = useMessage();

    return (
        <MessageContext.Provider
            value={{
                addMessage,
                getMessages,
            }}
        >
            {children}
        </MessageContext.Provider>
    );
};
