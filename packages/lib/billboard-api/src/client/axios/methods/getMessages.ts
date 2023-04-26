import { Axios } from 'axios';
import { Message } from 'dm3-lib-messaging';
import { log } from 'dm3-lib-shared';

export function getMessages(axios: Axios) {
    return async (
        idBillboard: string,
        time: number,
        idMessageCursor: string,
    ): Promise<Message[] | null> => {
        const url = `/rpc`;

        const body = {
            jsonrpc: '2.0',
            method: 'dm3_billboard_getMessages',
            params: [idBillboard],
        };
        const { data } = await axios.post(url, { data: body });

        const { error, result } = data;

        if (error) {
            log(error.message);
            return null;
        }
        return result;
    };
}
