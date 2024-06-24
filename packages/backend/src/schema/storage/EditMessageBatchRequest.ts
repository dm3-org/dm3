import EditMessageBatchRequestSchema from './EditMessageBatchRequest.schema.json';
import { _AddMessageRequest } from './AddMesssageRequest';

//This schema defines how the body of the editMessageBatch request has to look like
export interface _EditMessageBatchRequest {
    encryptedContactName: string;
    editMessageBatchPayload: _AddMessageRequest[];
}
export const EditMessageBatchRequest =
    EditMessageBatchRequestSchema.definitions._EditMessageBatchRequest;
