import { Message } from 'dm3-lib-messaging';

export interface IViewerService {
    getViewerCount(): number;
    broadcastMessage(idBillboard: string, message: Message): Promise<void>;
}
