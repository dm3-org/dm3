import { StorageEnvelopContainer } from '@dm3-org/dm3-lib-storage';
import { useContext, useEffect, useState } from 'react';
import { ConversationContext } from '../../context/ConversationContext';
import { StorageContext } from '../../context/StorageContext';
import { MessageActionType } from '../../utils/enum-type-utils';
import { Envelop, Message, MessageState } from '@dm3-org/dm3-lib-messaging';

type MessageStorage = { [contact: string]: StorageEnvelopContainer[] };

export const useMessage = () => {
    const { contacts } = useContext(ConversationContext);
    const {
        getNumberOfMessages,
        getMessages: getMessagesFromStorage,
        storeMessage,
    } = useContext(StorageContext);
    const [messages, setMessages] = useState<MessageStorage>({});

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
        // if (contact === "alice.eth") {
        //     console.log("Adding message to alice")
        //     const envelop = makeEnvelop("alice.eth", "me.eth", "Hello Bob")
        //     const envelopContainer: StorageEnvelopContainer = {
        //         envelop,
        //         messageState: MessageState.Created
        //     }
        //     storeMessage("alice.eth", envelopContainer)
        // }
    };

    const addMessage = (contact: string, message: StorageEnvelopContainer) => {
        setMessages((prev) => {
            return {
                ...prev,
                [contact]: [...(prev[contact] ?? []), message],
            };
        });
    };

    const getMessages = (contact: string) => {
        return messages[contact] ?? [];
    };

    const loadInitialMessages = async (contactName: string) => {
        const MAX_MESSAGES_PER_CHUNK = 100;
        const numberOfmessages = await getNumberOfMessages(contactName);
        const lastMessages = await getMessagesFromStorage(
            contactName,
            Math.floor(numberOfmessages / MAX_MESSAGES_PER_CHUNK),
        );

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
    };

    return {
        getMessages,
        addMessage,
    };
};

export type GetMessages = (contact: string) => StorageEnvelopContainer[];
export type AddMessage = (
    contact: string,
    message: StorageEnvelopContainer,
) => void;

export function makeEnvelop(
    from: string,
    to: string,
    msg: string,
    timestamp: number = 0,
) {
    const message: Message = {
        metadata: {
            to,
            from,
            timestamp,
            type: 'NEW',
        },
        message: msg,
        signature: '',
    };

    const envelop: Envelop = {
        message,
        metadata: {
            deliveryInformation: {
                from: '',
                to: '',
                deliveryInstruction: '',
            },
            encryptedMessageHash: '',
            version: '',
            encryptionScheme: '',
            signature: '',
        },
    };

    return envelop;
}
