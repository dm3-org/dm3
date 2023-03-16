import * as Lib from 'dm3-lib';
import axios from 'axios';
import { withAuthHeader } from '../withAuthHeader';
const DELIVERY_PATH = process.env.REACT_APP_BACKEND + '/delivery';

export async function fetchNewMessages(
    connection: Lib.Connection,
    token: string,
    contactAddress: string,
    baseUrl: string,
): Promise<Lib.messaging.EncryptionEnvelop[]> {
    const { account } = connection;

    const url = `${DELIVERY_PATH}/messages/${Lib.account.normalizeEnsName(
        account!.ensName,
    )}/contact/${contactAddress}`;

    const { data } = await Lib.account
        .getDeliveryServiceClient(
            account!.profile!,
            connection.provider!,
            async (url: string) => (await axios.get(url)).data,
        )
        .get(url, withAuthHeader(token));

    return data;
}
export type GetNewMessages = typeof fetchNewMessages;
