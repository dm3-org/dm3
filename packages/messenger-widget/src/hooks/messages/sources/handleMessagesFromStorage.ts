import { ContactPreview } from '../../../interfaces/utils';
import { GetMessages } from '../../storage/useStorage';
import { MessageModel, MessageStorage } from '../useMessage';

export const handleMessagesFromStorage = async (
    setContactsLoading: Function,
    getNumberOfMessages: (contactName: string) => Promise<number>,
    getMessagesFromStorage: GetMessages,
    contactName: string,
) => {
    setContactsLoading((prev: string[]) => {
        return [...prev, contactName];
    });
    const MAX_MESSAGES_PER_CHUNK = 100;
    const numberOfmessages = await getNumberOfMessages(contactName);
    const storedMessages = await getMessagesFromStorage(
        contactName,
        Math.floor(numberOfmessages / MAX_MESSAGES_PER_CHUNK),
    );

    console.log(`got messages from Storage for ${contactName}`, storedMessages);

    return storedMessages.map(
        (message) =>
            ({
                ...message,
                reactions: [],
            } as MessageModel),
    );
};
