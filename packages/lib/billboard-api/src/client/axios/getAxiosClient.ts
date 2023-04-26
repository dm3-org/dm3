import Axios from 'axios';
import { getMessages } from './methods/getMessages';
import { IBillboardApiClient } from '../IBillboardApiClient';
import { getBillboards } from './methods/getBillboards';
import { getBillboardProperties } from './methods/getBillboardProperties';
import { deleteMessage } from './methods/deleteMessage';
import { suspendSender } from './methods/suspendSender';

export function getAxiosClient(): IBillboardApiClient {
    const baseURL = process.env.REACT_APP_BILLBOARD_BACKEND;
    if (!baseURL) {
        throw Error('REACT_APP_BILLBOARD_BACKEND not set');
    }
    const axios = Axios.create({
        baseURL,
    });

    return {
        getMessages: getMessages(axios),
        deleteMessage: deleteMessage(axios),
        getBillboards: getBillboards(axios),
        getBillboardProperties: getBillboardProperties(axios),
        suspendSender: suspendSender(axios),
    };
}
