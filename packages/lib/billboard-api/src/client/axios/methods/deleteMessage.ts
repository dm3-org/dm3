import { Axios } from 'axios';
import { log } from 'dm3-lib-shared';

export function deleteMessage(axios: Axios) {
    return async (
        idBillboard: string,
        idMessage: string,
        mediator: string,
        signature: string,
    ): Promise<boolean> => {
        const url = `/rpc`;

        const body = {
            jsonrpc: '2.0',
            method: 'dm3_billboard_deleteMessage',
            params: [idBillboard, idMessage, mediator, signature],
        };

        const { data } = await axios.post(url, body);
        const { error, result } = data;
        if (error) {
            log(error.message);
            return false;
        }

        return true;
    };
}
