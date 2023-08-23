import React from 'react';
import {
    FetchAndStoreMessages,
    SubmitMessageType,
    fetchAndStoreMessages,
    submitMessage,
} from '../adapters/messages';

export type MessageContextType = {
    fetchAndStoreMessages: FetchAndStoreMessages;
    submitMessage: SubmitMessageType;
};

export const MessageContext = React.createContext<MessageContextType>({
    fetchAndStoreMessages,
    submitMessage,
});

export const MessageContextProvider = ({ children }: { children?: any }) => {
    return (
        <MessageContext.Provider
            value={{
                fetchAndStoreMessages,
                submitMessage,
            }}
        >
            {children}
        </MessageContext.Provider>
    );
};
