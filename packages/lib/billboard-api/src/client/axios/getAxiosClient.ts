import Axios from 'axios';
import { getMessages } from './methods/getMessages';
import { IBillboardApiClient } from '../IBillboardApiClient';
import { getBillboards } from './methods/getBillboards';
import { getBillboardProperties } from './methods/getBillboardProperties';
import { deleteMessage } from './methods/deleteMessage';
import { suspendSender } from './methods/suspendSender';
import { getActiveViewers } from './methods/getActiveSenders';

export function getAxiosClient(baseURL: string): IBillboardApiClient {
    const axios = Axios.create({
        baseURL,
    });

    return {
        getMessages: getMessages(axios),
        deleteMessage: deleteMessage(axios),
        getBillboards: getBillboards(axios),
        getBillboardProperties: getBillboardProperties(axios),
        suspendSender: suspendSender(axios),
        getActiveViewers: getActiveViewers(axios),
    };
}
