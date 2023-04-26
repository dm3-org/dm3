import { Axios } from 'axios';
import { log } from 'dm3-lib-shared';

export function suspendSender(axios: Axios) {
    return async (
        blockedSender: string,
        mediator: string,
        signature: string,
    ): Promise<boolean> => {
        const url = `/rpc`;

        const body = {
            jsonrpc: '2.0',
            method: 'dm3_billboard_suspendSender',
            params: [blockedSender, mediator, signature],
        };

        const { data } = await axios.post(url, { data: body });

        const { error } = data;

        if (error) {
            log(error.message);
            return false;
        }

        return true;
    };
}
