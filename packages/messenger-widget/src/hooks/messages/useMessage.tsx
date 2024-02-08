import {
    createPendingEntry,
    sendMessage,
    syncAcknoledgment,
} from '@dm3-org/dm3-lib-delivery-api';
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
import { decryptAsymmetric, encryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import {
    getDeliveryServiceProfile,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import axios from 'axios';
import { fetchNewMessages } from '../../adapters/messages';
import { Acknoledgment } from '@dm3-org/dm3-lib-delivery';

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

    useEffect(() => {
        console.log('new messages list ', messages);
    }, [messages]);

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
            console.log('storeMessage', contact, storageEnvelopContainer);
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
        (_contactName: string) => {
            const contactName = normalizeEnsName(_contactName);
            console.log('get messages for ', contactName);
            console.log('return messages ', messages[contactName] ?? []);
            return messages[contactName] ?? [];
        },
        [messages],
    );

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
        //Fetch the pending messages from the delivery service
        const encryptedIncommingMessages = await fetchNewMessages(
            mainnetProvider,
            account!,
            deliveryServiceToken!,
            contactName,
        );

        const incommingMessages: StorageEnvelopContainer[] = await Promise.all(
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
                };
            }),
        );

        console.log(
            `got messages from DS for ${contactName}`,
            incommingMessages,
        );
        //In the background we sync and acknowledge the messages and store then in the storage
        //acknowledgeAndStoreMessages(incommingMessages);
        return incommingMessages;
    };

    const loadInitialMessages = async (_contactName: string) => {
        const contactName = normalizeEnsName(_contactName);

        const initialMessages = await Promise.all([
            fetchMessagesFromStorage(contactName),
            fetchMessagesFromDeliveryService(contactName),
        ]);

        const messages = initialMessages
            .reduce((acc, val) => acc.concat(val), [])
            .filter(({ envelop }: StorageEnvelopContainer) => {
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
        msg: StorageEnvelopContainer[],
    ) => {
        const now = Date.now();

        const acknowledgements: Acknoledgment[] = [];
        msg.forEach((m) => {
            storeMessage(m.envelop.message.metadata?.from, m);
            acknowledgements.push({
                contactAddress: m.envelop.message.metadata?.from,
                messageDeliveryServiceTimestamp:
                    m.envelop.postmark?.incommingTimestamp!,
            });
        });

        if (acknowledgements.length === 0) {
            return;
        }

        //1707214461077
        //1707214461077
        const lowestTimestamp = Math.min(
            ...msg.map((m) => m.envelop.postmark?.incommingTimestamp!),
        );

        console.log('lowest timestammp', lowestTimestamp);

        await syncAcknoledgment(
            mainnetProvider!,
            account!,
            acknowledgements,
            deliveryServiceToken!,
            0,
        );
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
