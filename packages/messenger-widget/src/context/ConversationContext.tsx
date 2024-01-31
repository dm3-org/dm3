/* eslint-disable no-console */
import React from 'react';
import { useConversation } from '../hooks/conversation/useConversation';
import { ContactPreview } from '../interfaces/utils';

export type ConversationContextType = {
    contacts: ContactPreview[];
    conversationCount: number;
    selectedContact?: ContactPreview;
    setSelectedContactName: (contactEnsName: string | undefined) => void;
    initialized: boolean;
    addConversation: (ensName: string) => ContactPreview;
};

export const ConversationContext = React.createContext<ConversationContextType>(
    {
        contacts: [],
        setSelectedContactName: (contactEnsName: string | undefined) => {},
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
        setSelectedContactName,
        selectedContact,
    } = useConversation();

    return (
        <ConversationContext.Provider
            value={{
                addConversation,
                contacts,
                conversationCount,
                initialized,
                setSelectedContactName,
                selectedContact,
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};
