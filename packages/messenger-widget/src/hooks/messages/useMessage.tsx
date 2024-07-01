import { encryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import {
    DispatchableEnvelop,
    EncryptionEnvelop,
    Envelop,
    Message,
    MessageState,
    buildEnvelop,
} from '@dm3-org/dm3-lib-messaging';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { sha256, stringify } from '@dm3-org/dm3-lib-shared';
import { StorageEnvelopContainer as StorageEnvelopContainerNew } from '@dm3-org/dm3-lib-storage';
import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { DeliveryServiceContext } from '../../context/DeliveryServiceContext';
import { StorageContext } from '../../context/StorageContext';
import { TLDContext } from '../../context/TLDContext';
import { renderMessage } from './renderer/renderMessage';
import { checkIfEnvelopAreInSizeLimit } from './sizeLimit/checkIfEnvelopIsInSizeLimit';
import { handleMessagesFromDeliveryService } from './sources/handleMessagesFromDeliveryService';
import { handleMessagesFromStorage } from './sources/handleMessagesFromStorage';
import { handleMessagesFromWebSocket } from './sources/handleMessagesFromWebSocket';

const DEFAULT_MESSAGE_PAGESIZE = 100;

//Message source to identify where a message comes from. This is important to handle pagination of storage messages properly
export enum MessageSource {
    //Messages added by the client via addMessage
    Client,
    //Messages fetched from the storage
    Storage,
    //Messages fetched from the deliveryService
    DeliveryService,
    //Messages received from the Websocket
    WebSocket,
}

export type MessageModel = StorageEnvelopContainerNew & {
    reactions: Envelop[];
    replyToMessageEnvelop?: Envelop;
    source: MessageSource;
};

export type MessageStorage = {
    [contact: string]: MessageModel[];
};

export const useMessage = () => {
    const { contacts, selectedContact, addConversation } =
        useContext(ConversationContext);
    const { account, profileKeys } = useContext(AuthContext);
    const { fetchNewMessages, syncAcknowledgment } = useContext(
        DeliveryServiceContext,
    );

    const { onNewMessage, removeOnNewMessageListener } = useContext(
        DeliveryServiceContext,
    );

    const { resolveTLDtoAlias } = useContext(TLDContext);

    const {
        getMessages: getMessagesFromStorage,
        storeMessage,
        storeMessageBatch,
        editMessageBatchAsync,
        initialized: storageInitialized,
    } = useContext(StorageContext);

    const [messages, setMessages] = useState<MessageStorage>({});

    const [contactsLoading, setContactsLoading] = useState<string[]>([]);

    //Effect to listen for new contacts and add them to the message state
    useEffect(() => {
        //Find new contacts
        const newContacts = contacts.filter(
            (contact) => !messages[contact.contactDetails.account.ensName],
        );

        newContacts.forEach((contact) => {
            addNewContact(contact.contactDetails.account.ensName);
        });
    }, [contacts]);

    //Effect to reset the messages when the storage is initialized, i.e on account change
    useEffect(() => {
        setMessages({});
        setContactsLoading([]);
    }, [storageInitialized, account]);

    //Effect to handle new message emited from the websocket
    useEffect(() => {
        onNewMessage((encryptedEnvelop: EncryptionEnvelop) => {
            handleMessagesFromWebSocket(
                addConversation,
                setMessages,
                storeMessage,
                profileKeys!,
                selectedContact!,
                encryptedEnvelop,
                resolveTLDtoAlias,
            );
        });

        return () => {
            removeOnNewMessageListener();
        };
    }, [onNewMessage, selectedContact]);

    //Mark messages as read when the selected contact changes
    useEffect(() => {
        const _contact = selectedContact?.contactDetails.account.ensName;
        if (!_contact) {
            return;
        }

        const contact = normalizeEnsName(_contact);

        const unreadMessages = (messages[contact] ?? []).filter(
            (message) =>
                message.messageState !== MessageState.Read &&
                message.envelop.message.metadata.from !== account?.ensName,
        );

        setMessages((prev) => {
            //Check no new messages are added here
            return {
                ...prev,
                [contact]: [
                    ...(prev[contact] ?? []).map((message) => ({
                        ...message,
                        messageState: MessageState.Read,
                    })),
                ],
            };
        });

        editMessageBatchAsync(
            contact,
            unreadMessages.map((message) => ({
                ...message,
                messageState: MessageState.Read,
            })),
        );
    }, [selectedContact]);

    //View function that returns wether a contact is loading
    const contactIsLoading = useCallback(
        (_contactName?: string) => {
            if (!_contactName) {
                return false;
            }
            const contact = normalizeEnsName(_contactName);
            return contactsLoading.includes(contact);
        },
        [contactsLoading],
    );
    //View function that returns the messages for a contact
    const getMessages = useCallback(
        (_contactName: string) => {
            const contactName = normalizeEnsName(_contactName);
            return renderMessage(messages[contactName] ?? []);
        },
        [messages],
    );
    //View function that returns the number of unread messages for a contact
    const getUnreadMessageCount = useCallback(
        (_contactName: string) => {
            const contactName = normalizeEnsName(_contactName);
            if (!messages[contactName]) {
                return 0;
            }
            return messages[contactName].filter(
                (message) =>
                    message.messageState !== MessageState.Read &&
                    message.envelop.message.metadata.from !== account?.ensName,
            ).length;
        },
        [messages],
    );
    //When a new contact is added we load the initial messages
    const addNewContact = (_contactName: string) => {
        const contact = normalizeEnsName(_contactName);
        //Contact already exists
        if (messages[contact]) {
            return;
        }
        setMessages((prev) => {
            //Check no new messages are added here
            return {
                ...prev,
                [contact]: [],
            };
        });
        loadInitialMessages(contact);
    };

    const addMessage = async (
        _contactName: string,
        message: Message,
    ): Promise<{ isSuccess: boolean; error?: string }> => {
        const contact = normalizeEnsName(_contactName);
        //If a message is empty it should not be added

        if (!message.message || message.message.trim() === '') {
            return { isSuccess: false, error: 'Message is empty' };
        }

        //Find the recipient of the message in the contact list
        const recipient = contacts.find(
            (c) => c.contactDetails.account.ensName === contact,
        );
        /**
         * Check if the recipient has a PublicEncrptionKey
         * if not only keep the msg at the senders storage
         */
        const recipientIsDm3User =
            !!recipient?.contactDetails.account.profile?.publicEncryptionKey;

        //If the recipient is not a dm3 user we can store the message in the storage.
        //Ideally the message will be submitted once the receiver has created a profile.
        //https://github.com/orgs/dm3-org/projects/5?pane=issue&itemId=64716043 will refine this
        if (!recipientIsDm3User) {
            //StorageEnvelopContainerNew to store the message in the storage
            const messageModel: MessageModel = {
                envelop: {
                    message,
                    metadata: {
                        encryptionScheme: 'x25519-chacha20-poly1305',
                        //since we don't have a recipient we can't encrypt the deliveryInformation
                        deliveryInformation: '',
                        //Because storing a message is always an internal process we dont need to sign it. The signature is only needed for the delivery service
                        signature: '',
                        encryptedMessageHash: sha256(stringify(message)),
                        version: 'v1',
                    },
                },
                messageState: MessageState.Created,
                source: MessageSource.Client,
                reactions: [],
            };
            setMessages((prev) => {
                //Check message has been added previously
                return {
                    ...prev,
                    [contact]: [...(prev[contact] ?? []), messageModel],
                };
            });
            storeMessage(contact, messageModel);
            return { isSuccess: true };
        }

        //Build the envelops based on the message and the users profileKeys.
        //For each deliveryServiceProfile a envelop is created that will be sent to the delivery service
        const envelops = await Promise.all(
            recipient.contactDetails.deliveryServiceProfiles.map(
                async (deliverServiceProfile) => {
                    return await buildEnvelop(
                        message,
                        (publicKey: string, msg: string) =>
                            encryptAsymmetric(publicKey, msg),
                        {
                            from: account!,
                            to: recipient!.contactDetails.account,
                            deliverServiceProfile,
                            keys: profileKeys!,
                        },
                    );
                },
            ),
        );

        // check if message size in within delivery service message size limit
        const isMsgInSizeLimit = await checkIfEnvelopAreInSizeLimit(
            //Find the biggest envelop
            envelops.map((e) => e.encryptedEnvelop),
            recipient.messageSizeLimit,
        );

        // If message size is larger than limit, return with error
        if (!isMsgInSizeLimit) {
            return {
                isSuccess: false,
                error: 'The size of the message is larger than limit '
                    .concat(recipient.messageSizeLimit.toString(), ' bytes. ')
                    .concat('Please reduce the message size.'),
            };
        }

        //StorageEnvelopContainerNew to store the message in the storage
        const messageStorageContainer = {
            //On the senders end we store only the first envelop
            envelop: envelops[0].envelop,
            messageState: MessageState.Created,
            reactions: [],
            //Message has just been created by the client
            source: MessageSource.Client,
        };

        //Add the message to the state
        setMessages((prev) => {
            return {
                ...prev,
                [contact]: [...(prev[contact] ?? []), messageStorageContainer],
            };
        });

        //Storage the message in the storage
        storeMessage(contact, messageStorageContainer);

        // TODO send to receivers DS
        // When we have a recipient we can send the message using the socket connection

        //TODO either store msg in cache when sending or wait for the response from the delivery service¿
        const recipientDs = recipient.contactDetails.deliveryServiceProfiles;

        if (!recipientDs) {
            //TODO storage msg in storage
            return {
                isSuccess: false,
                error: 'Recipient has no delivery service profile',
            };
        }
        //Send the envelops to the delivery service
        await submitEnveloptsToReceiversDs(envelops);
        return { isSuccess: true };
    };

    const submitEnveloptsToReceiversDs = async (
        envelops: DispatchableEnvelop[],
    ) => {
        //Every DispatchableEnvelop is sent to the delivery service
        await Promise.all(
            envelops.map(async (envelop) => {
                return await axios
                    .create({ baseURL: envelop.deliveryServiceUrl })
                    .post('/rpc', {
                        jsonrpc: '2.0',
                        method: 'dm3_submitMessage',
                        params: [JSON.stringify(envelop.encryptedEnvelop)],
                    });
            }),
        );
    };

    const loadInitialMessages = async (_contactName: string) => {
        const contactName = normalizeEnsName(_contactName);
        const initialMessages = await Promise.all([
            handleMessagesFromStorage(
                setContactsLoading,
                getMessagesFromStorage,
                contactName,
                DEFAULT_MESSAGE_PAGESIZE,
                //For the first page we use 0 as offset
                0,
            ),
            handleMessagesFromDeliveryService(
                account!,
                profileKeys!,
                addConversation,
                storeMessageBatch,
                contactName,
                fetchNewMessages,
                syncAcknowledgment,
            ),
        ]);
        const flatten = initialMessages.reduce(
            (acc, val) => acc.concat(val),
            [],
        );
        await _addMessages(contactName, flatten);
    };

    const loadMoreMessages = async (_contactName: string): Promise<number> => {
        const contactName = normalizeEnsName(_contactName);

        const messagesFromContact = messages[contactName] ?? [];
        //For the messageCount we only consider emssages from the MessageSource storage
        const messageCount = messagesFromContact.filter(
            (message) => message.source === MessageSource.Storage,
        ).length;

        //We calculate the offset based on the messageCount
        const offset = Math.floor(messageCount / DEFAULT_MESSAGE_PAGESIZE);

        const messagesFromStorage = await handleMessagesFromStorage(
            setContactsLoading,
            getMessagesFromStorage,
            contactName,
            DEFAULT_MESSAGE_PAGESIZE,
            offset,
        );
        return await _addMessages(contactName, messagesFromStorage);
    };

    const _addMessages = async (
        _contactName: string,
        newMessages: MessageModel[],
    ) => {
        const contactName = normalizeEnsName(_contactName);

        newMessages
            //filter duplicates
            .filter((message, index, self) => {
                if (!message.envelop.metadata?.encryptedMessageHash) {
                    return true;
                }
                return (
                    index ===
                    self.findIndex(
                        (m) =>
                            m.envelop.metadata?.encryptedMessageHash ===
                            message.envelop.metadata?.encryptedMessageHash,
                    )
                );
            });

        const withResolvedAliasNames = await resolveAliasNames(newMessages);

        setMessages((prev) => {
            return {
                ...prev,
                [contactName]: [
                    ...(prev[contactName] ?? []),
                    ...withResolvedAliasNames,
                ],
            };
        });

        setContactsLoading((prev) => {
            return prev.filter((contact) => contact !== contactName);
        });

        // the count of new messages added
        return withResolvedAliasNames.length;
    };

    /**
     * Some messages from the old storage might not have the alias resolved yet.
     * We need to fetch them so they are not appearing as our own messages.
     */
    const resolveAliasNames = async (messages: MessageModel[]) => {
        return await Promise.all(
            messages.map(async (message) => {
                return {
                    ...message,
                    envelop: {
                        ...message.envelop,
                        message: {
                            ...message.envelop.message,
                            metadata: {
                                ...message.envelop.message.metadata,
                                from: normalizeEnsName(
                                    await resolveTLDtoAlias(
                                        message.envelop.message.metadata
                                            ?.from ?? '',
                                    ),
                                ),
                            },
                        },
                    },
                };
            }),
        );
    };

    return {
        messages,
        getUnreadMessageCount,
        getMessages,
        addMessage,
        loadMoreMessages,
        contactIsLoading,
    };
};

export type GetMessages = (contact: string) => MessageModel[];
export type AddMessage = (
    contact: string,
    message: Message,
) => Promise<{ isSuccess: boolean; error?: string }>;
export type ContactLoading = (contact: string) => boolean;
