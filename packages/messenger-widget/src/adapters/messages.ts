import axios from 'axios';
import { Envelop, EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import {
    Account,
    getDeliveryServiceClient,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { log } from '@dm3-org/dm3-lib-shared';
import { withAuthHeader } from './auth';
import { ethers } from 'ethers';
import { Connection } from '../interfaces/utils';

export async function fetchPendingConversations(
    backendUrl: string,
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
    token: string,
): Promise<string[]> {
    const deliveryPath = backendUrl + '/delivery';
    const url = `${deliveryPath}/messages/${account?.ensName!}/pending/`;

    const { data } = await getDeliveryServiceClient(
        account.profile!,
        mainnetProvider!,
        async (url: string) => (await axios.get(url)).data,
    ).post(url, {}, withAuthHeader(token));

    return data;
}

export async function createPendingEntry(
    connection: Connection,
    token: string,
    ensName: string,
    contactEnsName: string,
    onSuccess: () => void,
    onError: () => void,
): Promise<void> {
    if (connection.socket) {
        log(`Create pending entry`, 'info');
        connection.socket.emit(
            'pendingMessage',
            {
                ensName,
                contactEnsName,
                token,
            },
            (result: any) => {
                if (result.response === 'success') {
                    log(`Create pending entry: success`, 'info');
                    onSuccess();
                } else {
                    log(`Create pending entry: error`, 'error');
                    onError();
                }
            },
        );
    }
}

export async function sendMessage(
    connection: Connection,
    token: string,
    envelop: Envelop | EncryptionEnvelop,
    onSuccess: () => void,
    onError: () => void,
): Promise<void> {
    if (!connection.socket) {
        return;
    }
    connection.socket.emit(
        'submitMessage',
        {
            envelop,
            token,
        },
        (result: any) => {
            if (result.response === 'success') {
                log(`[sendMessage] success`, 'info');
                onSuccess();
            } else {
                log(`[sendMessage] error `, 'error');
                onError();
            }
        },
    );
}

export async function fetchNewMessages(
    backendUrl: string,
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
    token: string,
    contactAddress: string,
): Promise<EncryptionEnvelop[]> {
    const deliveryPath = backendUrl + '/delivery';
    const url = `${deliveryPath}/messages/${normalizeEnsName(
        account!.ensName,
    )}/contact/${contactAddress}`;

    const { data } = await getDeliveryServiceClient(
        account!.profile!,
        mainnetProvider!,
        async (url: string) => (await axios.get(url)).data,
    ).get(url, withAuthHeader(token));

    return data;
}

export type SendMessage = typeof sendMessage;
export type GetNewMessages = typeof fetchNewMessages;
export type CreatePendingEntry = typeof createPendingEntry;
export type FetchPendingConversations = typeof fetchPendingConversations;
