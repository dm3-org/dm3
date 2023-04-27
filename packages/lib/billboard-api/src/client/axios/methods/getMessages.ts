import { Axios } from 'axios';
import { Message } from 'dm3-lib-messaging';
import { makeRpcRequest } from '../makeRpcRequest';

export function getMessages(axios: Axios) {
    return async (
        idBillboard: string,
        time: number,
        idMessageCursor: string,
    ): Promise<Message[] | null> =>
        makeRpcRequest<Message[]>({
            axios,
            method: 'dm3_billboard_getMessages',
            params: [idBillboard, time.toString(), idMessageCursor],
        });
}
