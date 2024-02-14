import { MessageModel } from '../../useMessage';

export const renderDelete = (messages: MessageModel[]) => {
    const deleteMessages = messages.filter(
        (message) => message.envelop.message.metadata.type === 'DELETE_REQUEST',
    );

    const toBeDeletedByMessageHash = deleteMessages.map(
        (deleteMessage) =>
            deleteMessage.envelop.message.metadata.referenceMessageHash,
    );

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
