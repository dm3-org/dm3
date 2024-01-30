/* eslint-disable max-len */
/* eslint-disable no-console */
import { useContext, useEffect, useMemo, useState } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { ContactPreview } from '../../interfaces/utils';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { hydrateContract } from './hydrateContact';

export const useConversation = () => {
    const mainnetProvider = useMainnetProvider();
    const {
        getConversations,
        addConversationAsync,
        initialized: storageInitialized,
        getMessages,
        getNumberOfMessages,
    } = useContext(StorageContext);

    const [contacts, setContacts] = useState<Array<ContactPreview>>([]);
    const [selectedContact, setSelectedContact] = useState<
        ContactPreview | undefined
    >(undefined);
    const [initialized, setInitialized] = useState<boolean>(false);

    const conversationCount = useMemo(() => contacts.length, [contacts]);

    //For now we do not support pagination hence we always fetch all pages
    useEffect(() => {
        const init = async (page: number = 0) => {
            const currentConversationsPage = await getConversations(page);

            //Hydrate the contacts by fetching their profile and DS profile
            const newContacts = await Promise.all(
                currentConversationsPage.map((contact) =>
                    hydrateContract(
                        mainnetProvider,
                        contact,
                        getMessages,
                        getNumberOfMessages,
                    ),
                ),
            );
            //It might be the case that contacts are added via websocket. In this case we do not want to add them again
            const contactsWithoutDuplicates = newContacts.filter(
                (newContact) =>
                    !contacts.some(
                        (existingContact) =>
                            existingContact.contactDetails.account.ensName ===
                            newContact.contactDetails.account.ensName,
                    ),
            );

            setContacts((prev) => [...prev, ...contactsWithoutDuplicates]);
            if (currentConversationsPage.length > 0) {
                console.log('fetching page', page + 1);
                await init(page + 1);
            }
            console.log('done fetching', currentConversationsPage);
            setInitialized(true);
        };
        init();
    }, [storageInitialized]);

    const addConversation = async (ensName: string) => {
        const contact = await hydrateContract(
            mainnetProvider,
            ensName,
            getMessages,
            getNumberOfMessages,
        );
        setContacts((prev) => [...prev, contact]);
        addConversationAsync(ensName);
    };

    return {
        contacts,
        conversationCount,
        addConversation,
        initialized,
        setSelectedContact,
        selectedContact,
    };
};
