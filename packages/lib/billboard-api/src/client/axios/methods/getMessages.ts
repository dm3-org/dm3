import { Axios } from 'axios';
import { Message } from 'dm3-lib-messaging';
import { log } from 'dm3-lib-shared';

export function getMessages(axios: Axios) {
    return async (
        idBillboard: string,
        time: Date,
        idMessageCursor: string,
    ): Promise<Message[] | null> => {
        const url = `messages/${idBillboard}/${time}/${idMessageCursor} }`;

        try {
            const { data } = await axios.get<Message[]>(url);
            return data;
        } catch (e) {
            log("can't fetch billboard messages");
            log(e as string);
            return null;
        }
    };
}
