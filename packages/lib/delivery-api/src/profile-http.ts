import axios from 'axios';
import {
    Account,
    getDeliveryServiceClient,
    normalizeEnsName,
    SignedUserProfile,
} from '@dm3-org/dm3-lib-profile';

import { ethers } from 'ethers';
import { checkAccount, getAxiosConfig } from './utils';

/**
 * fetchs the alias chain for a given account
 * @param account The dm3 account
 * @param provider Ethers provider
 * @param backendUrl Backend url
 * @returns  an array containing the ENS names of the aliases
 */
export async function getAliasChain(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    backendUrl: string,
): Promise<string> {
    const { profile, ensName } = checkAccount(account);
    const profilePath = backendUrl + '/profile';
    const url = `${profilePath}/aliasChain/${normalizeEnsName(ensName)}`;

    const { data } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.get(url)).data,
    ).get(url);

    return data;
}
export type GetAliasChain = typeof getAliasChain;

/**
 * submits a dm3 user profile to the delivery service
 * @param account The dm3 account
 * @param provider Ethers provider
 * @param signedUserProfile the signed user profile
 * @param backendUrl Backend url
 * @returns the auth token
 */
export async function submitUserProfile(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    signedUserProfile: SignedUserProfile,
    backendUrl: string,
): Promise<string> {
    const { profile, ensName } = checkAccount(account);
    const profilePath = backendUrl + '/profile';
    const url = `${profilePath}/${normalizeEnsName(ensName)}`;

    const { data } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.get(url)).data,
    ).post(url, signedUserProfile);

    return data;
}
export type SubmitUserProfile = typeof submitUserProfile;

/**
 * submits a dm3 user profile to the delivery service
 * @param account The dm3 account
 * @param provider Ethers provider
 * @param token The auth token
 * @param contactEnsName The sender ENS name
 * @param backendUrl Backend url
 */
export async function createAlias(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    ensName: string,
    aliasEnsName: string,
    token: string,
    backendUrl: string,
): Promise<string> {
    const { profile } = checkAccount(account);
    const profilePath = backendUrl + '/profile';
    const url = `${profilePath}/${normalizeEnsName(
        ensName,
    )}/aka/${normalizeEnsName(aliasEnsName)}`;

    const { data } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.get(url)).data,
    ).post(url, {}, getAxiosConfig(token));

    return data;
}
export type CreateAlias = typeof createAlias;
