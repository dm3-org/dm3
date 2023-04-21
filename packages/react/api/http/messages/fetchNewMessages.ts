import axios from 'axios';
import { withAuthHeader } from '../withAuthHeader';
import { Connection } from '../../../src/web3provider/Web3Provider';
import { EncryptionEnvelop } from 'dm3-lib-messaging';
import { getDeliveryServiceClient, normalizeEnsName } from 'dm3-lib-profile';
const DELIVERY_PATH = process.env.REACT_APP_BACKEND + '/delivery';

export async function fetchNewMessages(
    connection: Connection,
    token: string,
    contactAddress: string,
    baseUrl: string,
): Promise<EncryptionEnvelop[]> {
    const { account } = connection;

    const url = `${DELIVERY_PATH}/messages/${normalizeEnsName(
        account!.ensName,
    )}/contact/${contactAddress}`;

    const { data } = await getDeliveryServiceClient(
        account!.profile!,
        connection.provider!,
        async (url: string) => (await axios.get(url)).data,
    ).get(url, withAuthHeader(token));

    return data;
}
export type GetNewMessages = typeof fetchNewMessages;
