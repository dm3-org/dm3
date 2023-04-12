import axios from 'axios';
import * as Lib from 'dm3-lib';
const DELIVERY_PATH = process.env.REACT_APP_BACKEND + '/delivery';
import { withAuthHeader } from '../withAuthHeader';
export async function fetchPendingConversations(
    connection: Lib.Connection,
    token: string,
): Promise<string[]> {
    const { account } = connection;

    const url = `${DELIVERY_PATH}/messages/${account?.ensName!}/pending/`;

    const { data } = await Lib.profile
        .getDeliveryServiceClient(
            connection.account?.profile!,
            connection.provider!,
            async (url: string) => (await axios.get(url)).data,
        )
        .post(url, {}, withAuthHeader(token));

    return data;
}
export type FetchPendingConversations = typeof fetchPendingConversations;
