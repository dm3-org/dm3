import { IBackendConnector } from '@dm3-org/dm3-lib-shared';
import { MessageRecord } from '../chunkStorage/ChunkStorageTypes';
import { Encryption, StorageAPI, StorageEnvelopContainer } from '../types';
//getCloudStorages is the interface to the cloud storage.
//It encrypts and decrypts the data before sending/reciving it to/from the cloud storage of the DM3 backend
export const getCloudStorage = (
    backendConnector: IBackendConnector,
    ensName: string,
    encryption: Encryption,
): StorageAPI => {
    const _addConversation = async (contactEnsName: string) => {
        const encryptedContactName = await encryption.encryptSync(
            contactEnsName,
        );
        return await backendConnector.addConversation(
            ensName,
            encryptedContactName,
        );
    };

    const getConversations = async (size: number, offset: number) => {
        const conversations = await backendConnector.getConversations(
            ensName,
            size,
            offset,
        );

        return await Promise.all(
            conversations.map(
                async ({
                    contact,
                    previewMessage,
                }: {
                    contact: string;
                    previewMessage: string | null;
                }) => ({
                    contactEnsName: await encryption.decryptSync(contact),
                    isHidden: false,
                    messageCounter: 0,
                    previewMessage: previewMessage
                        ? JSON.parse(
                              await encryption.decryptAsync(previewMessage),
                          )
                        : null,
                }),
            ),
        );
    };
    const getMessages = async (
        contactEnsName: string,
        pageSize: number,
        offset: number,
    ) => {
        const encryptedContactName = await encryption.encryptSync(
            contactEnsName,
        );

        const messageRecords = await backendConnector.getMessagesFromStorage(
            ensName,
            encryptedContactName,
            pageSize,
            offset,
        );
        const decryptedMessageRecords = await Promise.all(
            messageRecords.map(async (messageRecord: MessageRecord) => {
                const decryptedEnvelopContainer = await encryption.decryptAsync(
                    messageRecord.encryptedEnvelopContainer,
                );
                return JSON.parse(decryptedEnvelopContainer);
            }),
        );

        return decryptedMessageRecords as StorageEnvelopContainer[];
    };
    const getHaltedMessages = async () => {
        const messages = await backendConnector.getHaltedMessages(ensName);
        const decryptedMessages = await Promise.all(
            messages.map(async (message: MessageRecord) => {
                const decryptedEnvelopContainer = await encryption.decryptAsync(
                    message.encryptedEnvelopContainer,
                );
                console.log(
                    'decryptedEnvelopContainer haltedMessages',
                    decryptedEnvelopContainer,
                );

                return JSON.parse(decryptedEnvelopContainer);
            }),
        );

        return decryptedMessages as StorageEnvelopContainer[];
    };

    const _addMessage = async (
        contactEnsName: string,
        envelop: StorageEnvelopContainer,
        isHalted: boolean,
    ) => {
        const encryptedContactName = await encryption.encryptSync(
            contactEnsName,
        );
        const encryptedEnvelopContainer = await encryption.encryptAsync(
            JSON.stringify(envelop),
        );

        //The client defines the createdAt timestamp for the message so it can be used to sort the messages
        const createdAt = Date.now();

        await backendConnector.addMessage(
            ensName,
            encryptedContactName,
            envelop.envelop.metadata?.encryptedMessageHash! ??
                envelop.envelop.id,
            createdAt,
            encryptedEnvelopContainer,
            isHalted,
        );

        return '';
    };

    const _addMessageBatch = async (
        contactEnsName: string,
        batch: StorageEnvelopContainer[],
    ) => {
        const encryptedContactName = await encryption.encryptSync(
            contactEnsName,
        );
        const encryptedMessages: MessageRecord[] = await Promise.all(
            batch.map(
                async (storageEnvelopContainer: StorageEnvelopContainer) => {
                    const encryptedEnvelopContainer =
                        await encryption.encryptAsync(
                            JSON.stringify(storageEnvelopContainer),
                        );
                    //The client defines the createdAt timestamp for the message so it can be used to sort the messages
                    const createdAt = Date.now();
                    return {
                        encryptedEnvelopContainer,
                        createdAt,
                        messageId:
                            storageEnvelopContainer.envelop.metadata
                                ?.encryptedMessageHash! ??
                            storageEnvelopContainer.envelop.id,
                    };
                },
            ),
        );

        await backendConnector.addMessageBatch(
            ensName,
            encryptedContactName,
            encryptedMessages,
        );

        return '';
    };

    const _editMessageBatch = async (
        contactEnsName: string,
        batch: StorageEnvelopContainer[],
    ) => {
        const encryptedContactName = await encryption.encryptSync(
            contactEnsName,
        );
        //The client defines the createdAt timestamp for the message so it can be used to sort the messages
        const createdAt = Date.now();
        const encryptedMessages: MessageRecord[] = await Promise.all(
            batch.map(
                async (storageEnvelopContainer: StorageEnvelopContainer) => {
                    const encryptedEnvelopContainer =
                        await encryption.encryptAsync(
                            JSON.stringify(storageEnvelopContainer),
                        );
                    return {
                        encryptedEnvelopContainer,
                        messageId:
                            storageEnvelopContainer.envelop.metadata
                                ?.encryptedMessageHash!,
                        createdAt,
                    };
                },
            ),
        );
        await backendConnector.editMessageBatch(
            ensName,
            encryptedContactName,
            encryptedMessages,
        );
    };

    const _getNumberOfMessages = async (contactEnsName: string) => {
        const encryptedContactName = await encryption.encryptSync(
            contactEnsName,
        );

        return await backendConnector.getNumberOfMessages(
            ensName,
            encryptedContactName,
        );
    };

    const _getNumberOfConversations = async () => {
        return await backendConnector.getNumberOfConversations(ensName);
    };

    const _toggleHideConversation = async (
        contactEnsName: string,
        hide: boolean,
    ) => {
        const encryptedContactName = await encryption.encryptSync(
            contactEnsName,
        );
        await backendConnector.toggleHideConversation(
            ensName,
            encryptedContactName,
            hide,
        );
    };

    return {
        addConversation: _addConversation,
        getConversations,
        getMessages,
        addMessage: _addMessage,
        addMessageBatch: _addMessageBatch,
        editMessageBatch: _editMessageBatch,
        getHaltedMessages,
        getNumberOfMessages: _getNumberOfMessages,
        getNumberOfConverations: _getNumberOfConversations,
        toggleHideConversation: _toggleHideConversation,
    };
};
