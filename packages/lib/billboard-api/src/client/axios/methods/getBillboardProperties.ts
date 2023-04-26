import { Axios } from 'axios';
import { log } from 'dm3-lib-shared';
import { BillboardProperties } from '../../IBillboardApiClient';

export function getBillboardProperties(axios: Axios) {
    return async (idBillboard: string): Promise<BillboardProperties | null> => {
        const url = `/rpc`;

        const body = {
            jsonrpc: '2.0',
            method: 'dm3_billboard_properties',
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
