import { EncryptionEnvelop, Envelop } from '@dm3-org/dm3-lib-messaging';
import {
    Account,
    getDeliveryServiceClient,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { log } from '@dm3-org/dm3-lib-shared';
import axios from 'axios';
import { ethers } from 'ethers';
import { Connection } from '../interfaces/utils';
import { withAuthHeader } from './auth';

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
