import EditMessageBatchRequestSchema from './EditMessageBatchRequest.schema.json';
import { _AddMessageRequest } from './AddMesssageRequest';
import { MessageRecord } from '../../persistence/storage';

//This schema defines how the body of the editMessageBatch request has to look like
export interface _EditMessageBatchRequest {
    encryptedContactName: string;
    editMessageBatchPayload: MessageRecord[];
}
export const EditMessageBatchRequest = EditMessageBatchRequestSchema;
