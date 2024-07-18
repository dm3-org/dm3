import axios from 'axios';
import {
    Account,
    getDeliveryServiceClient,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { Acknowledgment } from '@dm3-org/dm3-lib-delivery';
import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import { ethers } from 'ethers';
import { checkAccount, getAxiosConfig } from './utils';

const DELIVERY_PATH = process.env.REACT_APP_BACKEND + '/delivery';

//TOOD REMOVE AFTER STORAGE REFACTOR
export async function syncAcknoledgment(
    provider: ethers.providers.JsonRpcProvider,
    account: Account,
    acknoledgments: Acknowledgment[],
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

/**
 * let the delivery service know that messages have been stored
 * and can be deleted on the delivery service
 * @param provider Ethers provider
 * @param account The dm3 account
 * @param acknoledgments Acknoledgment that messages have been stored
 * @param token The auth token
 * @param lastMessagePull Timestamp of the last message pull
 */
export async function syncAcknowledgment(
    provider: ethers.providers.JsonRpcProvider,
    account: Account,
    acknoledgments: Acknowledgment[],
    token: string,
    lastSyncTime: number,
): Promise<void> {
    const { profile } = checkAccount(account);

    const url = `${DELIVERY_PATH}/messages/${normalizeEnsName(
        account!.ensName,
    )}/syncAcknowledgment/${lastSyncTime}`;

    return getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.get(url)).data,
    ).post(url, { acknoledgments }, getAxiosConfig(token));
}
export type SyncAcknowledgment = typeof syncAcknoledgment;

/**
 * returns the bufferd message which were send form contactEnsName
 * @param account The dm3 account
 * @param token The auth token
 * @param contactEnsName The sender ENS name
 * @param provider Ethers provider
 */
export async function getNewMessages(
    account: Account,
    token: string,
    contactEnsName: string,
    provider: ethers.providers.JsonRpcProvider,
): Promise<EncryptionEnvelop[]> {
    const { profile } = checkAccount(account);

    const url = `${DELIVERY_PATH}/messages/${normalizeEnsName(
        account!.ensName,
    )}/contact/${contactEnsName}`;

    const { data } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.get(url)).data,
    ).get(url, getAxiosConfig(token));

    return data;
}
export type GetNewMessages = typeof getNewMessages;
