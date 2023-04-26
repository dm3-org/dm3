import { Axios } from 'axios';
import { makeRpcRequest } from '../makeRpcRequest';

export function getBillboards(axios: Axios) {
    return async (): Promise<string[] | null> =>
        makeRpcRequest<string[]>({
            axios,
            method: 'dm3_billboard_list',
            params: [],
        });
}
