export interface IBackendConnector {
    addConversation(ensName: string, encryptedContactName: string): void;
    getConversations(
        ensName: string,
        size: number,
        offset: number,
    ): Promise<
        {
            contact: string;
            previewMessage: string;
        }[]
    >;
    toggleHideConversation(
        ensName: string,
        encryptedContactName: string,
        hide: boolean,
    ): void;
    getMessagesFromStorage(
        ensName: string,
        encryptedContactName: string,
        pageSize: number,
        offset: number,
    ): Promise<any>;
    addMessage(
        ensName: string,
        encryptedContactName: string,
        messageId: string,
        encryptedEnvelopContainer: string,
    ): Promise<void>;
    addMessageBatch(
        ensName: string,
        encryptedContactName: string,
        messageBatch: any[],
    ): void;
    editMessageBatch(
        ensName: string,
        encryptedContactName: string,
        messageBatch: any[],
    ): void;
    getNumberOfMessages(
        ensName: string,
        encryptedContactName: string,
    ): Promise<number>;
    getNumberOfConversations(ensName: string): Promise<number>;
}
