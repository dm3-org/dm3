import AddMessageRequestSchema from './AddMessageRequest.schema.json';

//This schema defines how the body of the getMessage request has to look like
export interface _AddMessageRequest {
    //The encrypted message container
    encryptedEnvelopContainer: string;
    //The encrypted contact name
    encryptedContactName: string;
    //The message id defined by the client
    messageId: string;
    //The time the message was created, also defined by the client
    createdAt: number;
    //The message is halted if the message has not been delivered yet
    isHalted: boolean;
}
export const AddMessageRequest =
    AddMessageRequestSchema.definitions._AddMessageRequest;
