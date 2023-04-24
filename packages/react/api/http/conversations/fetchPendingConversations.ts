import axios from 'axios';
const DELIVERY_PATH = process.env.REACT_APP_BACKEND + '/delivery';
import { withAuthHeader } from '../withAuthHeader';
import { getDeliveryServiceClient } from 'dm3-lib-profile';
import { Connection } from '../../../src/web3provider/Web3Provider';
export async function fetchPendingConversations(
    connection: Connection,
    token: string,
): Promise<string[]> {
    const { account } = connection;

    const url = `${DELIVERY_PATH}/messages/${account?.ensName!}/pending/`;

    const { data } = await getDeliveryServiceClient(
        connection.account?.profile!,
        connection.provider!,
        async (url: string) => (await axios.get(url)).data,
    ).post(url, {}, withAuthHeader(token));

    return data;
}
export type FetchPendingConversations = typeof fetchPendingConversations;
