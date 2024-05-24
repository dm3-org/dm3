import axios from 'axios';
import {
    Account,
    getDeliveryServiceClient,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';

import { ethers } from 'ethers';
import { checkAccount } from './utils';

/**
 * request an auth token challenge
 * @param account The dm3 account
 * @param provider Ethers provider
 * @param backendUrl Backend url
 */
export async function getChallenge(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    backendUrl: string,
): Promise<string> {
    const { profile, ensName } = checkAccount(account);
    const authServicePath = backendUrl + '/auth';
    const url = `${authServicePath}/${normalizeEnsName(ensName)}`;

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
 * @param backendUrl Backend url
 */
export async function getNewToken(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    signature: string,
    backendUrl: string,
): Promise<string> {
    const { profile, ensName } = checkAccount(account);
    const authServicePath = backendUrl + '/auth';
    const url = `${authServicePath}/${normalizeEnsName(ensName)}`;

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
