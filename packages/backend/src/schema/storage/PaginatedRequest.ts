import PaginatedRequestSchema from './PaginatedRequest.schema.json';

//This schema defines how the body of the GetMessages request has to look like
export interface _PaginatedRequest {
    pageSize: number;
    offset: number;
}
export const PaginatedRequest = {
    ...PaginatedRequestSchema,
    definitions: {
        ...PaginatedRequestSchema.definitions,
        _PaginatedRequest: {
            ...PaginatedRequestSchema.definitions._PaginatedRequest,
            properties: {
                ...PaginatedRequestSchema.definitions._PaginatedRequest
                    .properties,
                //Extending schema to prevent negative numbers
                pageSize: { type: 'number', minimum: 0 },
                offset: { type: 'number', minimum: 0 },
            },
        },
    },
};
