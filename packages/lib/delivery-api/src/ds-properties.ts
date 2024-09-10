import axios from 'axios';
import { Account, getDeliveryServiceClient } from '@dm3-org/dm3-lib-profile';
import { ethers } from 'ethers';
import { checkAccount } from './utils';
import { DeliveryServiceProperties } from '@dm3-org/dm3-lib-delivery';

const RPC_PATH = process.env.REACT_APP_BACKEND + '/rpc';

/**
 * fetchs the delivery service properties
 * @param provider Ethers provider
 * @param account The dm3 account

 */
export async function getDeliveryServiceProperties(
    provider: ethers.providers.JsonRpcProvider,
    account: Account,
): Promise<DeliveryServiceProperties> {
    const { profile } = checkAccount(account);

    const { data } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.get(url)).data,
    ).post(RPC_PATH, {
        jsonrpc: '2.0',
        method: 'dm3_getDeliveryServiceProperties',
        params: [],
    });

    return JSON.parse(data.result);
}
export type GetDeliveryServiceProperties = typeof getDeliveryServiceProperties;
