import {
    addConversation,
    addMessageBatch,
    addMessage,
    editMessageBatch,
    getConversations,
    getMessagesFromStorage,
    getNumberOfMessages,
    getNumberOfConversations,
    toggleHideConversation,
} from './storage-http';
import { MessageRecord } from '../chunkStorage/ChunkStorageTypes';
import { Encryption, StorageAPI, StorageEnvelopContainer } from '../types';
export const getCloudStorage = (
    storageUrl: string,
    storageToken: string,
    ensName: string,
    encryption: Encryption,
): StorageAPI => {
    const _addConversation = async (contactEnsName: string) => {
        const encryptedContactName = await encryption.encrypt(contactEnsName);
        console.log('store new contact ', encryptedContactName);
        return await addConversation(
            storageUrl,
            storageToken,
            ensName,
            encryptedContactName,
        );
    };

    const getConversationList = async (page: number) => {
        const encryptedConversations = await getConversations(
            storageUrl,
            storageToken,
            ensName,
        );

        return await Promise.all(
            encryptedConversations.map(
                async (encryptedContactName: string) => ({
                    contactEnsName: await encryption.decrypt(
                        encryptedContactName,
                    ),
                    isHidden: false,
                    messageCounter: 0,
                }),
            ),
        );
    };
    const getMessages = async (contactEnsName: string, page: number) => {
        const messageRecords = await getMessagesFromStorage(
            storageUrl,
            storageToken,
            ensName,
            contactEnsName,
            page,
        );
        const decryptedMessageRecords = await Promise.all(
            messageRecords.map(async (messageRecord: MessageRecord) => {
                const decryptedEnvelopContainer = await encryption.decrypt(
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
        const encryptedContactName = await encryption.encrypt(contactEnsName);

        const encryptedEnvelopContainer = await encryption.encrypt(
            JSON.stringify(envelop),
        );
        await addMessage(
            storageUrl,
            storageToken,
            ensName,
            encryptedContactName,
            envelop.envelop.metadata?.encryptedMessageHash!,
            encryptedEnvelopContainer,
        );
        return '';
    };

    const _addMessageBatch = async (
        contactEnsName: string,
        batch: StorageEnvelopContainer[],
    ) => {
        const encryptedContactName = await encryption.encrypt(contactEnsName);

        const encryptedMessages: MessageRecord[] = await Promise.all(
            batch.map(async (message: StorageEnvelopContainer) => {
                const encryptedEnvelopContainer = await encryption.encrypt(
                    JSON.stringify(message.envelop),
                );
                return {
                    encryptedEnvelopContainer,
                    messageId: message.envelop.metadata?.encryptedMessageHash!,
                };
            }),
        );
        await addMessageBatch(
            storageUrl,
            storageToken,
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
        const encryptedContactName = await encryption.encrypt(contactEnsName);
        const encryptedMessages: MessageRecord[] = await Promise.all(
            batch.map(async (message: StorageEnvelopContainer) => {
                const encryptedEnvelopContainer = await encryption.encrypt(
                    JSON.stringify(message.envelop),
                );
                return {
                    encryptedEnvelopContainer,
                    messageId: message.envelop.metadata?.encryptedMessageHash!,
                };
            }),
        );
        await editMessageBatch(
            storageUrl,
            storageToken,
            ensName,
            encryptedContactName,
            encryptedMessages,
        );
    };

    const _getNumberOfMessages = async (contactEnsName: string) => {
        const encryptedContactName = await encryption.encrypt(contactEnsName);
        return await getNumberOfMessages(
            storageUrl,
            storageToken,
            ensName,
            encryptedContactName,
        );
    };

    const _getNumberOfConversations = async () => {
        return await getNumberOfConversations(
            storageUrl,
            storageToken,
            ensName,
        );
    };

    const _toggleHideConversation = async (
        contactEnsName: string,
        hide: boolean,
    ) => {
        const encryptedContactName = await encryption.encrypt(contactEnsName);
        await toggleHideConversation(
            storageUrl,
            storageToken,
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
