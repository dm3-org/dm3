import { createPendingEntry, sendMessage } from '@dm3-org/dm3-lib-delivery-api';
import {
    Envelop,
    Message,
    MessageState,
    buildEnvelop,
    createMessage,
} from '@dm3-org/dm3-lib-messaging';
import { StorageEnvelopContainer } from '@dm3-org/dm3-lib-storage';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { StorageContext } from '../../context/StorageContext';
import { Connection } from '../../interfaces/web3';
import { getHaltDelivery } from '../../utils/common-utils';
import { MessageActionType } from '../../utils/enum-type-utils';
import { encryptAsymmetric } from '@dm3-org/dm3-lib-crypto';

type MessageStorage = { [contact: string]: StorageEnvelopContainer[] };

export const useMessage = (connection: Connection) => {
    const { contacts } = useContext(ConversationContext);
    const { account, profileKeys, deliveryServiceToken } =
        useContext(AuthContext);
    const {
        getNumberOfMessages,
        getMessages: getMessagesFromStorage,
        storeMessage,
    } = useContext(StorageContext);
    const [messages, setMessages] = useState<MessageStorage>({});

    const [contactsLoading, setContactsLoading] = useState<string[]>([]);

    useEffect(() => {
        //Find new contacts
        const newContacts = contacts.filter(
            (contact) => !messages[contact.name],
        );

        newContacts.forEach((contact) => {
            addNewContact(contact.name);
        });
    }, [contacts]);

    useEffect(() => {
        console.log('new messages list ', messages);
    }, [messages]);

    const contactIsLoading = useCallback(
        (contact: string) => {
            return contactsLoading.includes(contact);
        },
        [contactsLoading],
    );

    const addNewContact = (contact: string) => {
        //Contact already exists
        if (messages[contact]) {
            return;
        }
        setMessages((prev) => {
            return {
                ...prev,
                [contact]: [],
            };
        });
        loadInitialMessages(contact);
    };

    const addMessage = async (contact: string, message: Message) => {
        //Find the recipient of the message in the contact list
        const recipient = contacts.find((c) => c.name === contact);

        // For whatever reason the we've to create a PendingEntry before we can send a message
        //We should probably refactor this to be more clear on the backend side
        createPendingEntry(
            connection.socket!,
            deliveryServiceToken!,
            message.metadata.from,
            message.metadata.to,
            () => {},
            () => {},
        );
        //Check if the recipient has a PublicEncrptionKey if not only keep the msg at the senders storage
        const recipientIsDm3User =
            !!recipient?.contactDetails.account.profile?.publicEncryptionKey;

        if (!recipientIsDm3User) {
            console.log('- Halt delivery');
            //StorageEnvelopContainer to store the message in the storage
            const storageEnvelopContainer = {
                envelop: {
                    message,
                },
                messageState: MessageState.Created,
            };
            setMessages((prev) => {
                return {
                    ...prev,
                    [contact]: [
                        ...(prev[contact] ?? []),
                        storageEnvelopContainer,
                    ],
                };
            });
            storeMessage(contact, storageEnvelopContainer);
            return;
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
        //StorageEnvelopContainer to store the message in the storage
        const storageEnvelopContainer = {
            envelop,
            messageState: MessageState.Created,
        };

        //Add the message to the state
        setMessages((prev) => {
            return {
                ...prev,
                [contact]: [...(prev[contact] ?? []), storageEnvelopContainer],
            };
        });

        //Storage the message in the storage
        storeMessage(contact, storageEnvelopContainer);

        //When we have a recipient we can send the message using the socket connection
        await sendMessage(
            connection.socket!,
            deliveryServiceToken!,
            encryptedEnvelop,
            () => {},
            () => console.log('submit message error'),
        );
    };

    const getMessages = useCallback(
        (contact: string) => {
            return messages[contact] ?? [];
        },
        [messages],
    );

    const loadInitialMessages = async (contactName: string) => {
        setContactsLoading((prev) => {
            return [...prev, contactName];
        });
        const MAX_MESSAGES_PER_CHUNK = 100;
        const numberOfmessages = await getNumberOfMessages(contactName);
        const lastMessages = await getMessagesFromStorage(
            contactName,
            Math.floor(numberOfmessages / MAX_MESSAGES_PER_CHUNK),
        );

        console.log(numberOfmessages, lastMessages);
        console.log(contactName, lastMessages);

        const messages = lastMessages.filter(
            ({ envelop }: StorageEnvelopContainer) => {
                return envelop.message.metadata?.type === MessageActionType.NEW;
            },
        );
        setMessages((prev) => {
            return {
                ...prev,
                [contactName]: messages,
            };
        });

        setContactsLoading((prev) => {
            return prev.filter((contact) => contact !== contactName);
        });
    };

    return {
        getMessages,
        addMessage,
        contactIsLoading,
    };
};

export type GetMessages = (contact: string) => StorageEnvelopContainer[];
export type AddMessage = (contact: string, message: Message) => void;

export type ContactLoading = (contact: string) => boolean;
