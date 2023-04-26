import { Axios } from 'axios';
import { makeRpcRequest } from '../makeRpcRequest';

export function getActiveViewers(axios: Axios) {
    return async (idBillboard: string): Promise<number | null> =>
        makeRpcRequest<number>({
            axios,
            method: 'dm3_billboard_countActiveViewers',
            params: [idBillboard],
        });
}
