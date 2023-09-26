import axios from 'axios';
import {
    EncryptionEnvelop,
    createJsonRpcCallSubmitMessage,
} from 'dm3-lib-messaging';

export function submitMessage(
    url: string,
    envelop: EncryptionEnvelop,
    token: string,
) {
    const req = createJsonRpcCallSubmitMessage(envelop, token);
    return axios.post(`/rpc`, req, { baseURL: url });
}
