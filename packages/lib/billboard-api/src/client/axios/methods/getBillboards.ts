import { Axios } from 'axios';
import { log } from 'dm3-lib-shared';

export function getBillboards(axios: Axios) {
    return async (): Promise<string[] | null> => {
        const url = `/billboards`;

        try {
            const { data } = await axios.get<string[]>(url);
            return data;
        } catch (e) {
            log("can't fetch billboards");
            log(e as string);
            return null;
        }
    };
}
