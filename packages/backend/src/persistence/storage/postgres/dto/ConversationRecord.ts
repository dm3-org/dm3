export type ConversationRecord = {
    //The encrypred contact name
    contact: string;
    //The last message of that user
    previewMessage: string | null;
    //The time the conversation was last updated
    updatedAt: Date;
};
