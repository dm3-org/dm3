/* eslint-disable max-len */
import {
    DeliveryInformation,
    EncryptionEnvelop,
} from '@dm3-org/dm3-lib-messaging';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { Conversation } from '@dm3-org/dm3-lib-storage/dist/new/types';
import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { DeliveryServiceContext } from '../../context/DeliveryServiceContext';
import { StorageContext } from '../../context/StorageContext';
import { TLDContext } from '../../context/TLDContext';
import { DM3Configuration } from '../../interfaces/config';
import { ContactPreview, getEmptyContact } from '../../interfaces/utils';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { hydrateContract } from './hydrateContact';

const DEFAULT_CONVERSATION_PAGE_SIZE = 2;

export const useConversation = (config: DM3Configuration) => {
    const mainnetProvider = useMainnetProvider();
    const { dm3Configuration } = useContext(DM3ConfigurationContext);
    const { account } = useContext(AuthContext);
    const {
        fetchIncommingMessages,
        isInitialized: deliveryServiceInitialized,
    } = useContext(DeliveryServiceContext);
    const {
        getConversations: getConversationsFromStorage,
        addConversationAsync: storeConversationAsync,
        initialized: storageInitialized,
        toggleHideContactAsync,
    } = useContext(StorageContext);

    const { resolveAliasToTLD, resolveTLDtoAlias } = useContext(TLDContext);

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
        const init = async () => {
            if (
                !account ||
                !storageInitialized ||
                !deliveryServiceInitialized
            ) {
                return;
            }

            const conversations = await Promise.all([
                //Get the last 5 conversations from the storage
                getConversationsFromStorage(DEFAULT_CONVERSATION_PAGE_SIZE, 0),
                //Get the conversations that have been added to the DS in absence of the user
                getConversationsFromDeliveryService(),
            ]);

            //Flatten the conversations and remove duplicates
            conversations
                .flat()
                .filter(
                    (conversation, index, self) =>
                        index ===
                        self.findIndex(
                            (t) =>
                                t.contactEnsName ===
                                conversation.contactEnsName,
                        ),
                )
                //Add the conversations to the list
                .forEach((conversation) => {
                    _addConversation(
                        conversation.contactEnsName,
                        conversation.isHidden,
                    );
                });

            initDefaultContact();
            setConversationsInitialized(true);
        };
        init();
    }, [storageInitialized, account, deliveryServiceInitialized]);

    const initDefaultContact = async () => {
        if (config.defaultContact) {
            const aliasName = await resolveTLDtoAlias(
                normalizeEnsName(config.defaultContact),
            );
            const defaultContactIsUser =
                account?.ensName === normalizeEnsName(aliasName!);

            //We do not want to add the default contact if it is the user
            if (defaultContactIsUser) {
                return;
            }

            const contractHasAlreadyBeenAdded = contacts.some(
                (contact) =>
                    contact.contactDetails.account.ensName ===
                    normalizeEnsName(aliasName!),
            );
            if (!contractHasAlreadyBeenAdded) {
                //I there are no conversations yet we add the default contact
                const defaultConversation: Conversation = {
                    contactEnsName: normalizeEnsName(aliasName!),
                    messageCounter: 0,
                    isHidden: false,
                };

                const hydratedDefaultContact = await hydrateContract(
                    mainnetProvider,
                    defaultConversation,
                    resolveAliasToTLD,
                    dm3Configuration.addressEnsSubdomain,
                );
                _setContactsSafe([hydratedDefaultContact]);
            }
        }
    };

    const getConversationsFromDeliveryService = async (): Promise<
        Conversation[]
    > => {
        //The DS does not exposes an endpoint to fetch pending conversations. Hence we're using the fetchIncommingMessages method.
        //We can make some optimizations here if we use the messages fetched from incommingMessages in useMessages aswell.
        //This would require a refactor of the useMessages away from a contact based model.
        //Maybe we decide to to this in the future, for now we're going to keep it simple
        const incommingMessages = await fetchIncommingMessages(
            account?.ensName as string,
        );
        //Every pending conversation is going to be added to the conversation list
        return (
            incommingMessages
                .map((pendingMessage: EncryptionEnvelop) => {
                    const contactEnsName = (
                        pendingMessage.metadata
                            .deliveryInformation as DeliveryInformation
                    ).from;

                    return {
                        contactEnsName,
                        messageCounter: 0,
                        isHidden: false,
                    };
                })
                //filter duplicates
                .filter((conversation: Conversation) => {
                    return !contacts.some(
                        (current) =>
                            current.contactDetails.account.ensName ===
                            conversation.contactEnsName,
                    );
                })
        );
    };

    const addConversation = (_ensName: string) => {
        //Adds the conversation to the conversation state
        const conversationPreview = _addConversation(_ensName, false);
        //Add the contact to the storage in the background
        storeConversationAsync(_ensName);

        return conversationPreview;
    };

    /**
     * When a conversation is added via the AddContacts dialog it should appeat in the conversation list immediately.
     * Hence we're doing a hydrate here asynchroniously in the background
     */
    const hydrateExistingContactAsync = async (contact: ContactPreview) => {
        const conversation: Conversation = {
            contactEnsName: contact.contactDetails.account.ensName,
            messageCounter: contact?.messageCount || 0,
            isHidden: contact.isHidden,
        };
        const hydratedContact = await hydrateContract(
            mainnetProvider,
            conversation,
            resolveAliasToTLD,
            dm3Configuration.addressEnsSubdomain,
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

    const hideContact = (_ensName: string) => {
        const ensName = normalizeEnsName(_ensName);
        _toggleHideContact(ensName, true);
        setSelectedContactName(undefined);
    };

    const unhideContact = (contact: ContactPreview) => {
        _toggleHideContact(contact.contactDetails.account.ensName, false);
        const unhiddenContact = {
            ...contact,
            isHidden: false,
        };
        setSelectedContactName(unhiddenContact.contactDetails.account.ensName);
        hydrateExistingContactAsync(unhiddenContact);
    };
    const _toggleHideContact = (_ensName: string, isHidden: boolean) => {
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
    const _addConversation = (_ensName: string, isHidden: boolean) => {
        const ensName = normalizeEnsName(_ensName);
        //Check if the contact is the user itself
        const isOwnContact = normalizeEnsName(account!.ensName) === ensName;
        //We don't want to add ourselfs
        if (isOwnContact) {
            return;
        }
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

        const newContact: ContactPreview = getEmptyContact(ensName, isHidden);
        //Set the new contact to the list
        _setContactsSafe([newContact]);
        //Hydrate the contact in the background
        hydrateExistingContactAsync(newContact);

        //Return the new onhydrated contact
        return newContact;
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
