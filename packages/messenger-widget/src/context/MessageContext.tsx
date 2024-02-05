import React from 'react';

import {
    AddMessage,
    GetMessages,
    useMessage,
} from '../hooks/messages/useMessage';
import { GlobalState } from '../utils/enum-type-utils';

export type MessageContextType = {
    getMessages: GetMessages;
    addMessage: AddMessage;
    contactIsLoading: (contact: string) => boolean;
};

export const MessageContext = React.createContext<MessageContextType>({
    getMessages: (contact: string) => [],
    addMessage: (contact: string, message: any) => {},
    contactIsLoading: (contact: string) => false,
});

export const MessageContextProvider = ({
    children,
    state,
}: {
    children?: any;
    state: GlobalState;
}) => {
    const { addMessage, getMessages, contactIsLoading } = useMessage(
        state.connection,
    );

    return (
        <MessageContext.Provider
            value={{
                addMessage,
                getMessages,
                contactIsLoading,
            }}
        >
            {children}
        </MessageContext.Provider>
    );
};
