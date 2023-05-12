import { Message } from 'dm3-lib-messaging';

export interface IViewerService {
    getViewerCount(): number;
    broadcastMessage(message: Message): Promise<void>;
}
