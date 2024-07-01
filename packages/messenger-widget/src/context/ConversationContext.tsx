/* eslint-disable no-console */
import React from 'react';
import { useConversation } from '../hooks/conversation/useConversation';
import { ContactPreview } from '../interfaces/utils';
import { DM3Configuration } from '../interfaces/config';

export type ConversationContextType = {
    contacts: ContactPreview[];
    conversationCount: number;
    selectedContact?: ContactPreview;
    setSelectedContactName: (contactEnsName: string | undefined) => void;
    initialized: boolean;
    addConversation: (ensName: string) => ContactPreview | undefined;
    loadMoreConversations: () => Promise<number>;
    hideContact: (ensName: string) => void;
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
        loadMoreConversations: () => {
            return new Promise((resolve, reject) => resolve(0));
        },
        hideContact: (ensName: string) => {},
    },
);

export const ConversationContextProvider = ({
    children,
    config,
}: {
    children?: any;
    config: DM3Configuration;
}) => {
    const {
        addConversation,
        contacts,
        conversationCount,
        initialized,
        setSelectedContactName,
        selectedContact,
        hideContact,
        loadMoreConversations,
    } = useConversation(config);

    return (
        <ConversationContext.Provider
            value={{
                addConversation,
                loadMoreConversations,
                contacts,
                conversationCount,
                initialized,
                setSelectedContactName,
                selectedContact,
                hideContact,
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};
