import React, { useContext } from 'react';
import {
    fetchAndStoreMessages,
    FetchAndStoreMessages,
} from './fetchAndStoreMessage/fetchAndStoreMessages';
import {
    submitMessage,
    SubmitMessageType,
} from './submitMessage/submitMessage';

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
