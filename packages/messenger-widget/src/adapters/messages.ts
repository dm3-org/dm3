/* eslint-disable no-console */
import axios from 'axios';
import { encryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import {
    SendDependencies,
    Message,
    Envelop,
    MessageState,
    buildEnvelop,
    EncryptionEnvelop,
} from '@dm3-org/dm3-lib-messaging';
import {
    Account,
    getDeliveryServiceClient,
    getDeliveryServiceProfile,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { log, stringify } from '@dm3-org/dm3-lib-shared';
import { StorageEnvelopContainer } from '@dm3-org/dm3-lib-storage';
import { Connection } from '../interfaces/web3';
import { withAuthHeader } from './auth';
import { decryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import { ethers } from 'ethers';

export async function fetchPendingConversations(
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
    token: string,
): Promise<string[]> {
    const deliveryPath = process.env.REACT_APP_BACKEND + '/delivery';
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
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
    token: string,
    contactAddress: string,
): Promise<EncryptionEnvelop[]> {
    const deliveryPath = process.env.REACT_APP_BACKEND + '/delivery';
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
