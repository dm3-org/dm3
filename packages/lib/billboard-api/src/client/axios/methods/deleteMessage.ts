import { Axios } from 'axios';
import { makeRpcRequest } from '../makeRpcRequest';

export function deleteMessage(axios: Axios) {
    return async (
        idBillboard: string,
        idMessage: string,
        mediator: string,
        signature: string,
    ): Promise<boolean> =>
        !!(await makeRpcRequest<boolean>({
            axios,
            method: 'dm3_billboard_deleteMessage',
            params: [idBillboard, idMessage, mediator, signature],
        }));
}
