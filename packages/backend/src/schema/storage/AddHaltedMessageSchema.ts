import AddHaltedMessageRequestSchema from './AddHaltedMessageRequest.schema.json';

//This schema defines how the body of the AddHaltedMessage request has to look like
export interface _AddHaltedMessageRequest {
    messageId: string;
    createdAt: number;
    encryptedEnvelopContainer: string;
}
export const AddHaltedMessageRequest = AddHaltedMessageRequestSchema;
