/* eslint-disable no-console */
import React from 'react';
import { useConversation } from '../hooks/conversation/useConversation';
import { ContactPreview } from '../interfaces/utils';

export type ConversationContextType = {
    contacts: ContactPreview[];
    conversationCount: number;
    initialized: boolean;
};

export const ConversationContext = React.createContext<ConversationContextType>(
    {
        contacts: [],
        conversationCount: 0,
        initialized: false,
    },
);

export const ConversationContextProvider = ({
    children,
}: {
    children?: any;
}) => {
    const { contacts, conversationCount, initialized } = useConversation();
    return (
        <ConversationContext.Provider
            value={{ contacts, conversationCount, initialized }}
        >
            {children}
        </ConversationContext.Provider>
    );
};
