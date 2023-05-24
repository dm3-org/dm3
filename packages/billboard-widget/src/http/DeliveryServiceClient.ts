import axios from 'axios';
import {
    EncryptionEnvelop,
    createJsonRpcCallSubmitMessage,
} from 'dm3-lib-messaging';

export const DeliveryServiceClient = (url: string) => {
    const submitMessage = (envelop: EncryptionEnvelop) => {
        const req = createJsonRpcCallSubmitMessage(envelop);
        return axios.post(`${url}rpc`, req);
    };

    return {
        submitMessage,
    };
};
