/* eslint-disable no-console */
import React from 'react';
import { useConversation } from '../hooks/conversation/useConversation';
import { ContactPreview } from '../interfaces/utils';

export type ConversationContextType = {
    contacts: ContactPreview[];
    conversationCount: number;
    selectedContact?: ContactPreview;
    setSelectedContact: (contact: ContactPreview | undefined) => void;
    initialized: boolean;
    addConversation: (ensName: string) => ContactPreview;
};

export const ConversationContext = React.createContext<ConversationContextType>(
    {
        contacts: [],
        setSelectedContact: (contact: ContactPreview | undefined) => {},
        conversationCount: 0,
        initialized: false,
        selectedContact: undefined,
        addConversation: (ensName: string) => {
            return {} as ContactPreview;
        },
    },
);

export const ConversationContextProvider = ({
    children,
}: {
    children?: any;
}) => {
    const {
        addConversation,
        contacts,
        conversationCount,
        initialized,
        setSelectedContact,
        selectedContact,
    } = useConversation();

    return (
        <ConversationContext.Provider
            value={{
                addConversation,
                contacts,
                conversationCount,
                initialized,
                setSelectedContact,
                selectedContact,
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};
