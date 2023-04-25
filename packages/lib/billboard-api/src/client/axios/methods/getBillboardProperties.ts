import { Axios } from 'axios';
import { log } from 'dm3-lib-shared';
import { BillboardProperties } from '../../IBillboardApiClient';

export function getBillboardProperties(axios: Axios) {
    return async (idBillboard: string): Promise<BillboardProperties | null> => {
        const url = `/billboard/${idBillboard}`;

        try {
            const { data } = await axios.get<BillboardProperties>(url);
            return data;
        } catch (e) {
            log("can't fetch billboard properties");
            log(e as string);
            return null;
        }
    };
}
