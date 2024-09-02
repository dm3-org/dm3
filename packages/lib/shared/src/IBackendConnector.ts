export interface IBackendConnector {
    addConversation(
        ensName: string,
        encryptedContactName: string,
        encryptedProfileLocation: string,
    ): void;
    getConversations(
        ensName: string,
        size: number,
        offset: number,
    ): Promise<
        {
            contact: string;
            encryptedProfileLocation: string;
            previewMessage: string;
            updatedAt: Date;
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
    getHaltedMessages: (ensName: string) => Promise<any[]>;
    clearHaltedMessages: (
        ensName: string,
        messageId: string,
        aliasName: string,
    ) => Promise<void>;
    addMessage(
        ensName: string,
        encryptedContactName: string,
        messageId: string,
        createdAt: number,
        encryptedEnvelopContainer: string,
        isHalted: boolean,
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
