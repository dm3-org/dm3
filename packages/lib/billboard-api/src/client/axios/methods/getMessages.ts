import { Axios } from 'axios';
import { Message } from 'dm3-lib-messaging';
import { makeRpcRequest } from '../makeRpcRequest';

export function getMessages(axios: Axios) {
    return async (
        idBillboard: string,
        time?: number,
        limit?: string,
    ): Promise<Message[] | null> => {
        const result = await makeRpcRequest<{ messages: Message[] }>({
            axios,
            method: 'dm3_billboard_getMessages',
            params: [
                idBillboard,
                time ? time.toString() : Date.now().toString(),
                limit ?? '50',
            ],
        });

        if (!result) {
            return null;
        }
        return result.messages;
    };
}
