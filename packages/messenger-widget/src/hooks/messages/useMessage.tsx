import { encryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import { createPendingEntry, sendMessage } from '@dm3-org/dm3-lib-delivery-api';
import {
    EncryptionEnvelop,
    Envelop,
    Message,
    MessageState,
    buildEnvelop,
} from '@dm3-org/dm3-lib-messaging';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { StorageEnvelopContainer as StorageEnvelopContainerNew } from '@dm3-org/dm3-lib-storage';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { StorageContext } from '../../context/StorageContext';
import { WebSocketContext } from '../../context/WebSocketContext';
import { renderMessage } from './renderer/renderMessage';
import { handleMessagesFromDeliveryService } from './sources/handleMessagesFromDeliveryService';
import { handleMessagesFromStorage } from './sources/handleMessagesFromStorage';
import { handleMessagesFromWebSocket } from './sources/handleMessagesFromWebSocket';
import { checkIfEnvelopIsInSizeLimit } from './sizeLimit/checkIfEnvelopIsInSizeLimit';
import { TLDContext } from '../../context/TLDContext';
import { DeliveryServiceContext } from '../../context/DeliveryServiceContext';

export type MessageModel = StorageEnvelopContainerNew & {
    reactions: Envelop[];
    replyToMessageEnvelop?: Envelop;
};

export type MessageStorage = {
    [contact: string]: MessageModel[];
};

export const useMessage = () => {
    const { contacts, selectedContact, addConversation } =
        useContext(ConversationContext);
    const { account, profileKeys } = useContext(AuthContext);
    const { getDeliveryServiceTokens, fetchNewMessages, syncAcknowledgment } =
        useContext(DeliveryServiceContext);

    const { onNewMessage, removeOnNewMessageListener, socket } =
        useContext(WebSocketContext);

    const { resolveTLDtoAlias } = useContext(TLDContext);

    const {
        getNumberOfMessages,
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
        const contact = selectedContact?.contactDetails.account.ensName;
        if (!contact) {
            return;
        }

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

        //Find the recipient of the message in the contact list
        const recipient = contacts.find(
            (c) => c.contactDetails.account.ensName === contact,
        );

        const deliveryServiceToken = getDeliveryServiceTokens()[0];

        // For whatever reason we've to create a PendingEntry before we can send a message
        //We should probably refactor this to be more clear on the backend side
        createPendingEntry(
            socket!,
            deliveryServiceToken!,
            message.metadata.from,
            message.metadata.to,
            () => {},
            () => {},
        );

        /**
         * Check if the recipient has a PublicEncrptionKey
         * if not only keep the msg at the senders storage
         */
        const recipientIsDm3User =
            !!recipient?.contactDetails.account.profile?.publicEncryptionKey;

        if (!recipientIsDm3User) {
            //StorageEnvelopContainerNew to store the message in the storage
            const messageModel: MessageModel = {
                envelop: {
                    message,
                },
                messageState: MessageState.Created,

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

        //Build the envelop based on the message and the users profileKeys
        const { envelop, encryptedEnvelop } = await buildEnvelop(
            message,
            (publicKey: string, msg: string) =>
                encryptAsymmetric(publicKey, msg),
            {
                from: account!,
                to: recipient!.contactDetails.account,
                deliverServiceProfile:
                    recipient?.contactDetails.deliveryServiceProfile!,
                keys: profileKeys!,
            },
        );

        // check if message size in within delivery service message size limit
        const isMsgInSizeLimit = await checkIfEnvelopIsInSizeLimit(
            encryptedEnvelop,
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
        const messageModel = {
            envelop,
            messageState: MessageState.Created,
            reactions: [],
        };

        //Add the message to the state
        setMessages((prev) => {
            return {
                ...prev,
                [contact]: [...(prev[contact] ?? []), messageModel],
            };
        });

        //Storage the message in the storage
        storeMessage(contact, messageModel);

        //When we have a recipient we can send the message using the socket connection
        await sendMessage(
            socket!,
            deliveryServiceToken!,
            encryptedEnvelop,
            () => {},
            () => console.log('submit message error'),
        );

        return { isSuccess: true };
    };

    const loadInitialMessages = async (_contactName: string) => {
        if (!fetchNewMessages || !syncAcknowledgment) return;
        const contactName = normalizeEnsName(_contactName);
        const initialMessages = await Promise.all([
            handleMessagesFromStorage(
                setContactsLoading,
                getNumberOfMessages,
                getMessagesFromStorage,
                contactName,
            ),
            handleMessagesFromDeliveryService(
                account!,
                profileKeys!,
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

        const messages = flatten
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

        const withResolvedAliasNames = await resolveAliasNames(messages);

        setMessages((prev) => {
            return {
                ...prev,
                [contactName]: withResolvedAliasNames,
            };
        });

        setContactsLoading((prev) => {
            return prev.filter((contact) => contact !== contactName);
        });
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
        contactIsLoading,
    };
};

export type GetMessages = (contact: string) => MessageModel[];
export type AddMessage = (
    contact: string,
    message: Message,
) => Promise<{ isSuccess: boolean; error?: string }>;
export type ContactLoading = (contact: string) => boolean;
