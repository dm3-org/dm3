import { Axios } from 'axios';
import { log } from 'dm3-lib-shared';

export function deleteMessage(axios: Axios) {
    return async (
        idBillboard: string,
        idMessage: string,
        mediator: string,
        signature: string,
    ): Promise<boolean> => {
        const url = `/message`;

        const body = {
            idBillboard,
            idMessage,
            mediator,
            signature,
        };
        try {
            const { status } = await axios.delete(url, { data: body });
            return status === 200;
        } catch (err) {
            log(err as string);
            return false;
        }
    };
}
