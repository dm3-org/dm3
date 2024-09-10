import { Axios } from 'axios';
import { makeRpcRequest } from '../makeRpcRequest';

export function getActiveViewers(axios: Axios) {
    return async (idBillboard: string): Promise<number | null> => {
        const result = await makeRpcRequest<{ viewers: number }>({
            axios,
            method: 'dm3_billboard_countActiveViewers',
            params: [idBillboard],
        });
        if (!result) {
            return null;
        }
        return result.viewers;
    };
}
