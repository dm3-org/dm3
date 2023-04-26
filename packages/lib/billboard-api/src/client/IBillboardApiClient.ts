import { Message } from 'dm3-lib-messaging';

//TODO move into billboard package once created
export type BillboardProperties = {
    name: string;
    mediators: string[];
    time: Date;
};
export interface IBillboardApiClient {
    //Messages
    getMessages: (
        idBillboard: string,
        time: Date,
        idMessageCursor: string,
    ) => Promise<Message[] | null>;
    deleteMessage: (
        idBillboard: string,
        idMessage: string,
        mediator: string,
        signature: string,
    ) => Promise<boolean>;

    //Billboard
    getBillboards: () => Promise<string[] | null>;
    getBillboardProperties: (
        idBillboard: string,
    ) => Promise<BillboardProperties | null>;
    suspendSender: (
        blockedSender: string,
        mediator: string,
        signature: string,
    ) => Promise<boolean>;
}
