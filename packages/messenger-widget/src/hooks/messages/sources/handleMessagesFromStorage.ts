import { GetMessages } from '../../storage/useStorage';
import { MessageModel, MessageSource } from '../useMessage';

export const handleMessagesFromStorage = async (
    setContactsLoading: Function,
    getMessagesFromStorage: GetMessages,
    contactName: string,
    pageSize: number,
    offSet: number,
) => {
    setContactsLoading((prev: string[]) => {
        return [...prev, contactName];
    });

    const storedMessages = await getMessagesFromStorage(
        contactName,
        pageSize,
        offSet,
    );

    return storedMessages.map(
        (message) =>
            ({
                ...message,
                reactions: [],
                //The message has been fetched from teh storage
                source: MessageSource.Storage,
            } as MessageModel),
    );
};
