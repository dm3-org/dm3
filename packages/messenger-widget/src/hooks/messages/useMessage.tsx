import { decryptAsymmetric, encryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import {
    createPendingEntry,
    sendMessage,
    syncAcknowledgment,
} from '@dm3-org/dm3-lib-delivery-api';
import {
    Envelop,
    Message,
    MessageState,
    buildEnvelop,
} from '@dm3-org/dm3-lib-messaging';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { StorageEnvelopContainerNew } from '@dm3-org/dm3-lib-storage';
import { useCallback, useContext, useEffect, useState } from 'react';
import { fetchNewMessages } from '../../adapters/messages';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { StorageContext } from '../../context/StorageContext';
import { Connection } from '../../interfaces/web3';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { renderMessage } from './renderer/renderMessage';

export type MessageModel = StorageEnvelopContainerNew & {
    reactions: Envelop[];
    replyToMessageEnvelop?: Envelop;
};

export type MessageStorage = {
    [contact: string]: MessageModel[];
};

export const useMessage = (connection: Connection) => {
    const { contacts, selectedContact } = useContext(ConversationContext);
    const { account, profileKeys, deliveryServiceToken } =
        useContext(AuthContext);
    const {
        getNumberOfMessages,
        getMessages: getMessagesFromStorage,
        storeMessage,
        storeMessageBatch,
        editMessageBatchAsync,
    } = useContext(StorageContext);

    const mainnetProvider = useMainnetProvider();
    const [messages, setMessages] = useState<MessageStorage>({});

    const [contactsLoading, setContactsLoading] = useState<string[]>([]);

    useEffect(() => {
        //Find new contacts
        const newContacts = contacts.filter(
            (contact) => !messages[contact.contactDetails.account.ensName],
        );

        newContacts.forEach((contact) => {
            addNewContact(contact.contactDetails.account.ensName);
        });
    }, [contacts]);

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

    const getMessages = useCallback(
        (_contactName: string) => {
            const contactName = normalizeEnsName(_contactName);
            return renderMessage(messages[contactName] ?? []);
        },
        [messages],
    );
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

    //Mark messages as read when the selected contact changes
    useEffect(() => {
        const contact = selectedContact?.contactDetails.account.ensName;
        if (!contact) {
            return;
        }

        const unreadMessages = messages[contact]?.filter(
            (message) =>
                message.messageState !== MessageState.Read &&
                message.envelop.message.metadata.from !== account?.ensName,
        );

        setMessages((prev) => {
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

    const addNewContact = (_contactName: string) => {
        const contact = normalizeEnsName(_contactName);
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

    const addMessage = async (_contactName: string, message: Message) => {
        const contact = normalizeEnsName(_contactName);
        //Find the recipient of the message in the contact list
        const recipient = contacts.find(
            (c) => c.contactDetails.account.ensName === contact,
        );

        // For whatever reason we've to create a PendingEntry before we can send a message
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
            //StorageEnvelopContainerNew to store the message in the storage
            const messageModel: MessageModel = {
                envelop: {
                    message,
                },
                messageState: MessageState.Created,
                messageChunkKey: '',
                reactions: [],
            };
            setMessages((prev) => {
                return {
                    ...prev,
                    [contact]: [...(prev[contact] ?? []), messageModel],
                };
            });
            storeMessage(contact, messageModel);
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
        //StorageEnvelopContainerNew to store the message in the storage
        const messageModel = {
            envelop,
            messageState: MessageState.Created,
            messageChunkKey: '',
            reactions: [],
        };

        //Add the message to the state
        setMessages((prev) => {
            return {
                ...prev,
                [contact]: [...(prev[contact] ?? []), messageModel],
            };
        });
        console.log('storeMessage', contact, messageModel);

        //Storage the message in the storage
        storeMessage(contact, messageModel);

        //When we have a recipient we can send the message using the socket connection
        await sendMessage(
            connection.socket!,
            deliveryServiceToken!,
            encryptedEnvelop,
            () => {},
            () => console.log('submit message error'),
        );
    };

    const fetchMessagesFromStorage = async (contactName: string) => {
        setContactsLoading((prev) => {
            return [...prev, contactName];
        });
        const MAX_MESSAGES_PER_CHUNK = 100;
        const numberOfmessages = await getNumberOfMessages(contactName);
        const storedMessages = await getMessagesFromStorage(
            contactName,
            Math.floor(numberOfmessages / MAX_MESSAGES_PER_CHUNK),
        );

        console.log(
            `got messages from Storage for ${contactName}`,
            storedMessages,
        );

        return storedMessages.map(
            (message) =>
                ({
                    ...message,
                    reactions: [],
                } as MessageModel),
        );
    };

    const fetchMessagesFromDeliveryService = async (contactName: string) => {
        const lastSyncTime = Date.now();
        //Fetch the pending messages from the delivery service
        const encryptedIncommingMessages = await fetchNewMessages(
            mainnetProvider,
            account!,
            deliveryServiceToken!,
            contactName,
        );

        const incommingMessages: MessageModel[] = await Promise.all(
            encryptedIncommingMessages.map(async (envelop) => {
                const decryptedEnvelop: Envelop = {
                    message: JSON.parse(
                        await decryptAsymmetric(
                            profileKeys?.encryptionKeyPair!,
                            JSON.parse(envelop.message),
                        ),
                    ),
                    postmark: JSON.parse(
                        await decryptAsymmetric(
                            profileKeys?.encryptionKeyPair!,
                            JSON.parse(envelop.postmark!),
                        ),
                    ),
                    metadata: envelop.metadata,
                };
                return {
                    envelop: decryptedEnvelop,
                    //Messages from the delivery service are already send by the sender
                    messageState: MessageState.Send,
                    messageChunkKey: '',
                    reactions: [],
                };
            }),
        );

        const messagesSortedASC = incommingMessages.sort((a, b) => {
            return (
                a.envelop.postmark?.incommingTimestamp! -
                b.envelop.postmark?.incommingTimestamp!
            );
        });

        console.log(
            `got messages from DS for ${contactName}`,
            messagesSortedASC,
        );
        //In the background we sync and acknowledge the messages and store then in the storage
        acknowledgeAndStoreMessages(
            contactName,
            messagesSortedASC,
            lastSyncTime,
        );
        return messagesSortedASC;
    };

    const loadInitialMessages = async (_contactName: string) => {
        const contactName = normalizeEnsName(_contactName);

        const initialMessages = await Promise.all([
            fetchMessagesFromStorage(contactName),
            fetchMessagesFromDeliveryService(contactName),
        ]);

        const flatten = initialMessages.reduce(
            (acc, val) => acc.concat(val),
            [],
        );

        const messages = flatten
            //filter duplicates
            .filter((message, index, self) => {
                return (
                    index ===
                    self.findIndex(
                        (m) =>
                            m.envelop.metadata?.encryptedMessageHash ===
                            message.envelop.metadata?.encryptedMessageHash,
                    )
                );
            });

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

    const acknowledgeAndStoreMessages = async (
        contact: string,
        msg: StorageEnvelopContainerNew[],
        fetchedTime: number,
    ) => {
        await storeMessageBatch(contact, msg);

        await syncAcknowledgment(
            mainnetProvider!,
            account!,
            [
                {
                    contactAddress: contact,
                    //This value is not used in the backend hence we can set it to 0
                    messageDeliveryServiceTimestamp: 0,
                },
            ],
            deliveryServiceToken!,
            fetchedTime,
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
export type AddMessage = (contact: string, message: Message) => void;

export type ContactLoading = (contact: string) => boolean;
