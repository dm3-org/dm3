/* eslint-disable max-len */
/* eslint-disable no-console */
import { getAccountDisplayName } from '@dm3-org/dm3-lib-profile';
import { useContext, useEffect, useMemo, useState } from 'react';
import humanIcon from '../../assets/images/human.svg';
import { AuthContext } from '../../context/AuthContext';
import { StorageContext } from '../../context/StorageContext';
import { ContactPreview } from '../../interfaces/utils';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { hydrateContract } from './hydrateContact';
import { Conversation } from '@dm3-org/dm3-lib-storage/dist/new/types';

export const useConversation = () => {
    const mainnetProvider = useMainnetProvider();
    const {
        getConversations,
        addConversationAsync,
        initialized: storageInitialized,
        getMessages,
        getNumberOfMessages,
        toggleHideContactAsync,
    } = useContext(StorageContext);

    const [contacts, setContacts] = useState<Array<ContactPreview>>([]);
    const [selectedContactName, setSelectedContactName] = useState<
        string | undefined
    >(undefined);
    const [conversationsInitialized, setConversationsInitialized] =
        useState<boolean>(false);

    const conversationCount = useMemo(() => contacts.length, [contacts]);

    const { account } = useContext(AuthContext);

    const selectedContact = useMemo(() => {
        return contacts.find(
            (contact) =>
                contact.contactDetails.account.ensName === selectedContactName,
        );
    }, [selectedContactName, contacts]);

    //For now we do not support pagination hence we always fetch all pages
    useEffect(() => {
        setConversationsInitialized(false);
        setSelectedContactName(undefined);
        setContacts([]);
        const init = async (page: number = 0) => {
            const currentConversationsPage = await getConversations(page);

            //Hydrate the contacts by fetching their profile and DS profile
            const newContacts = await Promise.all(
                currentConversationsPage.map((conversation) =>
                    hydrateContract(
                        mainnetProvider,
                        conversation,
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

            console.log('contracts from storage', contactsWithoutDuplicates);

            setContacts((prev) => [...prev, ...contactsWithoutDuplicates]);
            if (currentConversationsPage.length > 0) {
                await init(page + 1);
            }

            setConversationsInitialized(true);
        };
        init();
    }, [storageInitialized, account]);

    const addConversation = (ensName: string) => {
        const alreadyAddedContact = contacts.find(
            (existingContact) =>
                existingContact.contactDetails.account.ensName === ensName,
        );
        //If the contact is already in the list return it
        if (alreadyAddedContact) {
            //Unhide the contact if it was hidden
            if (alreadyAddedContact.isHidden) {
                unhideContact(ensName);
            }
            return alreadyAddedContact;
        }

        const newContact: ContactPreview = {
            name: getAccountDisplayName(ensName, 25),
            message: null,
            image: humanIcon,
            unreadMsgCount: 0,
            messageCount: 0,
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
        hydrateExistingContactAsync(newContact);

        //Return the new onhydrated contact
        return newContact;
    };
    //When a conversation is added via the AddContacts dialog it should appeat in the conversation list immediately. Hence we're doing a hydrate here asynchroniously in the background
    const hydrateExistingContactAsync = async (contact: ContactPreview) => {
        const conversation: Conversation = {
            contactEnsName: contact.contactDetails.account.ensName,
            messageCounter: contact?.messageCount || 0,
            isHidden: contact.isHidden,
            key: '',
        };
        const hydratedContact = await hydrateContract(
            mainnetProvider,
            conversation,
            getMessages,
            getNumberOfMessages,
        );
        console.log('hydrated contact', hydratedContact);
        setContacts((prev) => {
            return prev.map((existingContact) => {
                //Find the contact in the list and replace it with the hydrated one
                if (
                    existingContact.contactDetails.account.ensName ===
                    conversation.contactEnsName
                ) {
                    return hydratedContact;
                }
                return existingContact;
            });
        });
    };

    const toggleHideContact = (ensName: string, isHidden: boolean) => {
        setContacts((prev) => {
            return prev.map((existingContact) => {
                //Find the contact in the list and replace it with the hydrated one
                if (
                    existingContact.contactDetails.account.ensName === ensName
                ) {
                    return {
                        ...existingContact,
                        isHidden,
                    };
                }
                return existingContact;
            });
        });
        //update the storage
        toggleHideContactAsync(ensName, isHidden);
    };

    const hideContact = (ensName: string) => {
        toggleHideContact(ensName, true);
        setSelectedContactName(undefined);
    };

    const unhideContact = (ensName: string) => {
        toggleHideContact(ensName, false);
    };

    return {
        contacts,
        conversationCount,
        addConversation,
        initialized: conversationsInitialized,
        setSelectedContactName,
        selectedContact,
        hideContact,
        unhideContact,
    };
};