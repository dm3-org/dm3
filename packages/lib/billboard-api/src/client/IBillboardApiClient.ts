import { Message } from 'dm3-lib-messaging';

export interface IBillboardApiClient {
    //Messages
    getMessages: (
        idBillboard: string,
        time: Date,
        idMessageCursor: string,
    ) => Promise<Message[] | null>;

    //Billboard
    getBillboards: () => Promise<string[] | null>;
}
