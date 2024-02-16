import { MessageModel } from '../../useMessage';

export const renderDelete = (messages: MessageModel[]) => {
    //We filter out all messages that are deleted
    const deleteMessages = messages.filter(
        (message) => message.envelop.message.metadata.type === 'DELETE_REQUEST',
    );

    //We get the message hash of the messages that are to be deleted
    const toBeDeletedByMessageHash = deleteMessages.map(
        (deleteMessage) =>
            deleteMessage.envelop.message.metadata.referenceMessageHash,
    );
    //We return the messages with out messages that are to be deleted and the delete requests
    return messages
        .filter(
            (message) =>
                !toBeDeletedByMessageHash.includes(
                    message.envelop.metadata?.encryptedMessageHash,
                ),
        )
        .filter(
            (message) =>
                message.envelop.message.metadata.type !== 'DELETE_REQUEST',
        );
};
