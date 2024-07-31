export type ConversationRecord = {
    //The encrypred contact name
    contact: string;
    //The last message of that user
    previewMessage: string | null;
    //The time the conversation was last updated
    updatedAt: Date;
    //This field can be used by the client to store information about the contacts TLD name
    encryptedContactTLDName: string;
};
