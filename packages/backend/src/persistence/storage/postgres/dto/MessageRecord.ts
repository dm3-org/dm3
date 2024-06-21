//The data model for a message record
export type MessageRecord = {
    //Creation time of the message
    createdAt: number;
    //The message id. This is the primary key passed by the client.
    //The client itself is responsible for generating the id because the server is not able to decrypt the message to get the message hash.
    messageId: string;
    //The actual encrypted message
    encryptedEnvelopContainer: string;
};
