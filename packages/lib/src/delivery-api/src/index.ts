import axios from 'axios';
import {
    Account,
    formatAddress,
    getDeliveryServiceClient,
    normalizeEnsName,
    SignedUserProfile,
} from 'dm3-lib-account';
import { Acknoledgment } from 'dm3-lib-delivery';
import { EncryptionEnvelop } from 'dm3-lib-messaging';
import { ethers } from 'ethers';

const PROFILE_PATH = process.env.REACT_APP_BACKEND + '/profile';
const DELIVERY_PATH = process.env.REACT_APP_BACKEND + '/delivery';
const AUTH_SERVICE_PATH = process.env.REACT_APP_BACKEND + '/auth';
const PROFILE_BASE_URL = process.env.REACT_APP_PROFILE_BASE_URL;

function getAxiosConfig(token: string) {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}

function checkAccount(account: Account | undefined): Required<Account> {
    if (!account) {
        throw Error('No account');
    }
    if (!account.profile) {
        throw Error('Account has no profile.');
    }
    return account as Required<Account>;
}

export async function getNameForAddress(
    address: string,
): Promise<string | undefined> {
    const url = `${PROFILE_BASE_URL}/name/${formatAddress(address)}`;
    try {
        const { data } = await axios.get(url);
        return data.name;
    } catch (e) {
        return;
    }
}
export type GetNameForAddress = typeof getNameForAddress;

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

export async function syncAcknoledgment(
    provider: ethers.providers.JsonRpcProvider,
    account: Account,
    acknoledgments: Acknoledgment[],
    token: string,
    lastMessagePull: number,
): Promise<void> {
    const { profile } = checkAccount(account);

    const url = `${DELIVERY_PATH}/messages/${normalizeEnsName(
        account!.ensName,
    )}/syncAcknoledgment/${lastMessagePull}`;

    return getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.get(url)).data,
    ).post(url, { acknoledgments }, getAxiosConfig(token));
}
export type SyncAcknoledgment = typeof syncAcknoledgment;

export async function getNewMessages(
    account: Account,
    token: string,
    contactAddress: string,
    provider: ethers.providers.JsonRpcProvider,
): Promise<EncryptionEnvelop[]> {
    const { profile } = checkAccount(account);

    const url = `${DELIVERY_PATH}/messages/${normalizeEnsName(
        account!.ensName,
    )}/contact/${contactAddress}`;

    const { data } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.get(url)).data,
    ).get(url, getAxiosConfig(token));

    return data;
}
export type GetNewMessages = typeof getNewMessages;
