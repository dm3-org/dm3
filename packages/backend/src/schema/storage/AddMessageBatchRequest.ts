import AddMessageBatchRequestSchema from './AddMessageBatchRequest.schema.json';
import { MessageRecord } from '../../persistence/storage';

//This schema defines how the body of the addMessageBatch request has to look like
export interface _AddMessageBatchRequest {
    messageBatch: MessageRecord[];
    //The encrypted contact name
    encryptedContactName: string;
}
export const AddMessageBatchRequest = AddMessageBatchRequestSchema;
