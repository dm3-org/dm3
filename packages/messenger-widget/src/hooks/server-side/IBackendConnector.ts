interface IBackendConnector {
    addConversation(ensName: string, encryptedContactName: string): void;
    getConversations(ensName: string): Promise<string[]>;
    toggleHideConversation(
        ensName: string,
        encryptedContactName: string,
        hide: boolean,
    ): void;
    getMessagesFromStorage(
        ensName: string,
        encryptedContactName: string,
        pageNumber: number,
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
