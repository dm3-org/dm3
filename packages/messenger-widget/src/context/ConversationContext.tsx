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
    hideContact: (ensName: string) => void;
    unhideContact: (ensName: string) => void;
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
        hideContact: (ensName: string) => {},
        unhideContact: (ensName: string) => {},
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
        hideContact,
        unhideContact,
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
                hideContact,
                unhideContact,
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};
