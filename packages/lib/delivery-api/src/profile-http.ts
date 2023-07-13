import axios from 'axios';
import {
    Account,
    getDeliveryServiceClient,
    normalizeEnsName,
    SignedUserProfile,
} from 'dm3-lib-profile';

import { ethers } from 'ethers';
import { checkAccount, getAxiosConfig } from './utils';

const PROFILE_PATH = process.env.REACT_APP_BACKEND + '/profile';

/**
 * submits a dm3 user profile to the delivery service
 * @param account The dm3 account
 * @param provider Ethers provider
 * @param signedUserProfile the signed user profile
 * @returns the auth token
 */
export async function submitUserProfile(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    signedUserProfile: SignedUserProfile,
): Promise<string> {
    const { profile, ensName } = checkAccount(account);

    const url = `${PROFILE_PATH}/${normalizeEnsName(ensName)}`;

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

 */
export async function createAlias(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    ensName: string,
    aliasEnsName: string,
    token: string,
): Promise<string> {
    const { profile } = checkAccount(account);

    const url = `${PROFILE_PATH}/${normalizeEnsName(
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
