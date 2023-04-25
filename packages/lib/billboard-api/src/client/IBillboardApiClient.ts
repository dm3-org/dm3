import { Message } from 'dm3-lib-messaging';

export interface IBillboardApiClient {
    getMessages: (
        idBillboard: string,
        time: Date,
        idMessageCursor: string,
    ) => Promise<Message[] | null>;
}
