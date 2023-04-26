import { Axios } from 'axios';
import { log } from 'dm3-lib-shared';

export function getBillboards(axios: Axios) {
    return async (): Promise<string[] | null> => {
        const url = `/rpc`;

        const body = {
            jsonrpc: '2.0',
            method: 'dm3_billboard_list',
            params: [],
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
