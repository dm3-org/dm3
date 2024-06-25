import GetMessagesRequestSchema from './GetMessagesRequest.schema.json';
import { _AddMessageRequest } from './AddMesssageRequest';
import { MessageRecord } from '../../persistence/storage';

//This schema defines how the body of the GetMessages request has to look like
export interface _GetMessagesRequest {
    pageSize: number;
    offset: number;
}
export const GetMessagesRequest = {
    ...GetMessagesRequestSchema,
    definitions: {
        ...GetMessagesRequestSchema.definitions,
        _GetMessagesRequest: {
            ...GetMessagesRequestSchema.definitions._GetMessagesRequest,
            properties: {
                ...GetMessagesRequestSchema.definitions._GetMessagesRequest
                    .properties,
                //Extending schema to prevent negative numbers
                pageSize: { type: 'number', minimum: 0 },
                offset: { type: 'number', minimum: 0 },
            },
        },
    },
};
