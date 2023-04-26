import { Axios } from 'axios';
import { makeRpcRequest } from '../makeRpcRequest';

export function suspendSender(axios: Axios) {
    return async (
        blockedSender: string,
        mediator: string,
        signature: string,
    ): Promise<boolean> =>
        !!(await makeRpcRequest<boolean>({
            axios,
            method: 'dm3_billboard_suspendSender',
            params: [blockedSender, mediator, signature],
        }));
}
