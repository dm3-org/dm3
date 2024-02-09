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
import { useCallback, useContext, useEffect, useState } from 'react';
import { fetchNewMessages } from '../../adapters/messages';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { StorageContext } from '../../context/StorageContext';
import { Connection } from '../../interfaces/web3';
import { MessageActionType } from '../../utils/enum-type-utils';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { Acknoledgment } from '@dm3-org/dm3-lib-delivery';
import { StorageEnvelopContainerNew } from '@dm3-org/dm3-lib-storage';

export type MessageStorage = {
    [contact: string]: StorageEnvelopContainerNew[];
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
            return messages[contactName] ?? [];
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
                (message) => message.messageState !== MessageState.Read,
            ).length;
        },
        [messages],
    );

    //Mark messages as read when the selected contact changes
    useEffect(() => {
        console.log('selectedContact', selectedContact);
    }, [messages]);

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
            //StorageEnvelopContainerNew to store the message in the storage
            const storageEnvelopContainer: StorageEnvelopContainerNew = {
                envelop: {
                    message,
                },
                messageState: MessageState.Created,
                messageChunkKey: '',
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
        //StorageEnvelopContainerNew to store the message in the storage
        const storageEnvelopContainer = {
            envelop,
            messageState: MessageState.Created,
            messageChunkKey: '',
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

        return storedMessages;
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

        const incommingMessages: StorageEnvelopContainerNew[] =
            await Promise.all(
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

        const messages = initialMessages
            .reduce((acc, val) => acc.concat(val), [])
            .filter(({ envelop }: StorageEnvelopContainerNew) => {
                return envelop.message.metadata?.type === MessageActionType.NEW;
            })
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

export type GetMessages = (contact: string) => StorageEnvelopContainerNew[];
export type AddMessage = (contact: string, message: Message) => void;

export type ContactLoading = (contact: string) => boolean;
