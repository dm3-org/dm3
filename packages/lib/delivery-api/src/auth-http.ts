import axios from 'axios';
import {
    Account,
    getDeliveryServiceClient,
    normalizeEnsName,
} from 'dm3-lib-profile';

import { ethers } from 'ethers';
import { checkAccount } from './utils';

const AUTH_SERVICE_PATH = process.env.REACT_APP_BACKEND + '/auth';

/**
 * request an auth token challenge
 * @param account The dm3 account
 * @param provider Ethers provider
 */
export async function getChallenge(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
): Promise<string> {
    const { profile, ensName } = checkAccount(account);

    const url = `${AUTH_SERVICE_PATH}/${normalizeEnsName(ensName)}`;

    const { data } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.get(url)).data,
    ).get(url);

    return data.challenge;
}
export type GetChallenge = typeof getChallenge;

/**
 * submit the challenge
 * @param account The dm3 account
 * @param provider Ethers provider
 * @param signature Signature created by signing the challenge
 */
export async function getNewToken(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    signature: string,
): Promise<string> {
    const { profile, ensName } = checkAccount(account);

    const url = `${AUTH_SERVICE_PATH}/${normalizeEnsName(ensName)}`;

    const { data } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.get(url)).data,
    ).post(url, {
        signature,
    });

    return data.token;
}
export type GetNewToken = typeof getNewToken;
