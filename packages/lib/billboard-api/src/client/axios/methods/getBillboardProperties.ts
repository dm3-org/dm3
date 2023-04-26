import { Axios } from 'axios';
import { BillboardProperties } from '../../IBillboardApiClient';
import { makeRpcRequest } from '../makeRpcRequest';

export function getBillboardProperties(axios: Axios) {
    return async (idBillboard: string): Promise<BillboardProperties | null> =>
        makeRpcRequest<BillboardProperties>({
            axios,
            method: 'dm3_billboard_properties',
            params: [idBillboard],
        });
}
