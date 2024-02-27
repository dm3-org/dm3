/* eslint-disable max-len */
import { Conversation } from '@dm3-org/dm3-lib-storage/dist/new/types';
import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { StorageContext } from '../../context/StorageContext';
import { ContactPreview, getDefaultContract } from '../../interfaces/utils';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { hydrateContract } from './hydrateContact';
import { fetchPendingConversations } from '../../adapters/messages';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { Config } from '../../interfaces/config';
import { WebSocketContext } from '../../context/WebSocketContext';
import { TLDContext } from '../../context/TLDContext';
import { GlobalContext } from '../../utils/context-utils';

export const useConversation = (config: Config) => {
    const mainnetProvider = useMainnetProvider();
    const { state } = useContext(GlobalContext);
    const { account, deliveryServiceToken } = useContext(AuthContext);
    const {
        getConversations,
        addConversationAsync,
        initialized: storageInitialized,
        toggleHideContactAsync,
    } = useContext(StorageContext);
    const { resolveAliasToTLD } = useContext(TLDContext);

    const [contacts, setContacts] = useState<Array<ContactPreview>>([]);
    const [selectedContactName, setSelectedContactName] = useState<
        string | undefined
    >(undefined);
    const [conversationsInitialized, setConversationsInitialized] =
        useState<boolean>(false);

    const conversationCount = useMemo(() => contacts.length, [contacts]);

    const selectedContact = useMemo(() => {
        return contacts.find(
            (contact) =>
                contact.contactDetails.account.ensName === selectedContactName,
        );
    }, [selectedContactName, contacts]);

    const _setContactsSafe = (newContacts: ContactPreview[]) => {
        setContacts((prev) => {
            //We do not want to add duplicates to the list
            const withoutDuplicates = prev.filter(
                (existingContact) =>
                    !newContacts.some(
                        (newContact) =>
                            newContact.contactDetails.account.ensName ===
                            existingContact.contactDetails.account.ensName,
                    ),
            );

            return [...withoutDuplicates, ...newContacts];
        });
    };

    //For now we do not support pagination hence we always fetch all pages
    useEffect(() => {
        setConversationsInitialized(false);
        setSelectedContactName(undefined);
        setContacts([]);
        const init = async (page: number = 0) => {
            if (!account || !storageInitialized) {
                return;
            }
            const currentConversationsPage = await getConversations(page);

            //Hydrate the contacts by fetching their profile and DS profile
            const storedContacts = await Promise.all(
                currentConversationsPage.map((conversation) => {
                    const isHidden = conversation.isHidden;
                    //Hydrating is the most expensive operation. Hence we only hydrate if the contact is not hidden
                    if (isHidden) {
                        //If the contact is hidden we only return the contact with the default values. Once its unhidden it will be hydrated
                        return {
                            ...getDefaultContract(conversation.contactEnsName),
                            isHidden: true,
                        };
                    }
                    return hydrateContract(
                        mainnetProvider,
                        conversation,
                        resolveAliasToTLD,
                    );
                }),
            );
            //It might be the case that contacts are added via websocket. In this case we do not want to add them again

            _setContactsSafe(storedContacts);

            //as long as there is no pagination we fetch the next page until we get an empty page
            if (currentConversationsPage.length > 0) {
                await init(page + 1);
            }
            await handlePendingConversations(state.dm3Configuration.backendUrl);
            initDefaultContact();
            setConversationsInitialized(true);
        };
        init();
    }, [storageInitialized, account]);

    const initDefaultContact = async () => {
        if (config.defaultContact) {
            const contractHasAlreadyBeenAdded = contacts.some(
                (contact) =>
                    contact.contactDetails.account.ensName ===
                    normalizeEnsName(config.defaultContact!),
            );
            if (!contractHasAlreadyBeenAdded) {
                //I there are no conversations yet we add the default contact
                const defaultConversation: Conversation = {
                    contactEnsName: normalizeEnsName(config.defaultContact),
                    messageCounter: 0,
                    isHidden: false,
                    key: '',
                };
                const hydratedDefaultContact = await hydrateContract(
                    mainnetProvider,
                    defaultConversation,
                    resolveAliasToTLD,
                );
                _setContactsSafe([hydratedDefaultContact]);
            }
        }
    };

    const handlePendingConversations = async (backendUrl: string) => {
        //At first we've to check if there are pending conversations not yet added to the list
        const pendingConversations = await fetchPendingConversations(
            backendUrl,
            mainnetProvider,
            account!,
            deliveryServiceToken!,
        );
        //Every pending conversation is going to be added to the conversation list
        pendingConversations.forEach((pendingConversation) => {
            addConversation(pendingConversation);
        });
    };

    const addConversation = (_ensName: string) => {
        const ensName = normalizeEnsName(_ensName);
        const alreadyAddedContact = contacts.find(
            (existingContact) =>
                existingContact.contactDetails.account.ensName === ensName,
        );
        //If the contact is already in the list return it
        if (alreadyAddedContact) {
            //Unhide the contact if it was hidden
            if (alreadyAddedContact.isHidden) {
                unhideContact(alreadyAddedContact);
            }
            return alreadyAddedContact;
        }

        const newContact: ContactPreview = getDefaultContract(ensName);
        //Set the new contact to the list
        _setContactsSafe([newContact]);
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
            resolveAliasToTLD,
        );
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

    const toggleHideContact = (_ensName: string, isHidden: boolean) => {
        const ensName = normalizeEnsName(_ensName);
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

    const hideContact = (_ensName: string) => {
        const ensName = normalizeEnsName(_ensName);
        toggleHideContact(ensName, true);
        setSelectedContactName(undefined);
    };

    const unhideContact = (contact: ContactPreview) => {
        toggleHideContact(contact.contactDetails.account.ensName, false);
        const unhiddenContact = {
            ...contact,
            isHidden: false,
        };
        setSelectedContactName(unhiddenContact.contactDetails.account.ensName);
        hydrateExistingContactAsync(unhiddenContact);
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
