import { IBackendConnector } from '@dm3-org/dm3-lib-shared';
import { MessageRecord } from '../chunkStorage/ChunkStorageTypes';
import { Encryption, StorageAPI, StorageEnvelopContainer } from '../types';
export const getCloudStorage = (
    backendConnector: IBackendConnector,
    ensName: string,
    encryption: Encryption,
): StorageAPI => {
    const _addConversation = async (contactEnsName: string) => {
        const encryptedContactName = await encryption.encryptSync(
            contactEnsName,
        );
        console.log('store new contact ', encryptedContactName);
        return await backendConnector.addConversation(
            ensName,
            encryptedContactName,
        );
    };

    const getConversationList = async (page: number) => {
        const encryptedConversations = await backendConnector.getConversations(
            ensName,
        );

        return await Promise.all(
            encryptedConversations.map(
                async (encryptedContactName: string) => ({
                    contactEnsName: await encryption.decryptSync(
                        encryptedContactName,
                    ),
                    isHidden: false,
                    messageCounter: 0,
                }),
            ),
        );
    };
    const getMessages = async (contactEnsName: string, page: number) => {
        const encryptedContactName = await encryption.encryptSync(
            contactEnsName,
        );

        const messageRecords = await backendConnector.getMessagesFromStorage(
            ensName,
            encryptedContactName,
            page,
        );
        const decryptedMessageRecords = await Promise.all(
            messageRecords.map(async (messageRecord: MessageRecord) => {
                const decryptedEnvelopContainer = await encryption.decryptAsync(
                    messageRecord.encryptedEnvelopContainer,
                );
                return JSON.parse(decryptedEnvelopContainer);
            }),
        );

        //TODO make type right
        return decryptedMessageRecords as StorageEnvelopContainer[];
    };

    const _addMessage = async (
        contactEnsName: string,
        envelop: StorageEnvelopContainer,
    ) => {
        const encryptedContactName = await encryption.encryptSync(
            contactEnsName,
        );
        const encryptedEnvelopContainer = await encryption.encryptAsync(
            JSON.stringify(envelop),
        );

        await backendConnector.addMessage(
            ensName,
            encryptedContactName,
            envelop.envelop.metadata?.encryptedMessageHash! ??
                envelop.envelop.id,
            encryptedEnvelopContainer,
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
                    return {
                        encryptedEnvelopContainer,
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
        getConversationList,
        getMessages,
        addMessage: _addMessage,
        addMessageBatch: _addMessageBatch,
        editMessageBatch: _editMessageBatch,
        getNumberOfMessages: _getNumberOfMessages,
        getNumberOfConverations: _getNumberOfConversations,
        toggleHideConversation: _toggleHideConversation,
    };
};
