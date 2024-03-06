/* eslint-disable no-console */
import React from 'react';
import { useConversation } from '../hooks/conversation/useConversation';
import { ContactPreview } from '../interfaces/utils';
import { Config, Dm3Props } from '../interfaces/config';

export type ConversationContextType = {
    contacts: ContactPreview[];
    conversationCount: number;
    selectedContact?: ContactPreview;
    setSelectedContactName: (contactEnsName: string | undefined) => void;
    initialized: boolean;
    addConversation: (ensName: string) => ContactPreview;
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
        hideContact: (ensName: string) => {},
    },
);

export const ConversationContextProvider = ({
    children,
    config,
}: {
    children?: any;
    config: Config;
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
    } = useConversation(config);

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
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};
