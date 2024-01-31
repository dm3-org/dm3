/* eslint-disable max-len */
/* eslint-disable no-console */
import { useContext, useEffect, useMemo, useState } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { ContactPreview } from '../../interfaces/utils';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { hydrateContract } from './hydrateContact';
import { getAccountDisplayName } from '@dm3-org/dm3-lib-profile';
import humanIcon from '../../assets/images/human.svg';

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
                await init(page + 1);
            }
            setInitialized(true);
        };
        init();
    }, [storageInitialized]);

    const addConversation = (ensName: string) => {
        const alreadyAddedContact = contacts.find(
            (existingContact) =>
                existingContact.contactDetails.account.ensName === ensName,
        );
        //If the contact is already in the list return it
        if (alreadyAddedContact) {
            return alreadyAddedContact;
        }

        const newContact: ContactPreview = {
            name: getAccountDisplayName(ensName, 25),
            message: '',
            image: humanIcon,
            unreadMsgCount: 0,
            contactDetails: {
                account: {
                    ensName,
                },
                deliveryServiceProfile: undefined,
            },
            isHidden: false,
        };
        //Set the new contact to the list
        setContacts((prev) => [...prev, newContact]);
        //Add the contact to the storage in the background
        addConversationAsync(ensName);
        //Hydrate the contact in the background
        hydrateExistingContactAsync(ensName);

        //Return the new onhydrated contact
        return newContact;
    };
    //When a conversation is added via the AddContacts dialog it should appeat in the conversation list immediately. Hence we're doing a hydrate here asynchroniously in the background
    const hydrateExistingContactAsync = async (ensName: string) => {
        const hydratedContact = await hydrateContract(
            mainnetProvider,
            ensName,
            getMessages,
            getNumberOfMessages,
        );
        setContacts((prev) => {
            return prev.map((existingContact) => {
                //Find the contact in the list and replace it with the hydrated one
                if (
                    existingContact.contactDetails.account.ensName === ensName
                ) {
                    return hydratedContact;
                }
                return existingContact;
            });
        });
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
