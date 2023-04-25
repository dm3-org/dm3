import Axios from 'axios';
import { getMessages } from './methods/getMessages';
import { IBillboardApiClient } from '../IBillboardApiClient';

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
    };
}
