import { ethers } from 'ethers';
import { ApiConnection } from './Web3Provider';

export interface Message {
    to: string;
    timestamp: number;
    message: string;
}

export interface Envelop {
    message: string;
    signature: string;
}

export enum MessageState {
    Created,
    Signed,
    Send,
}

export function createMessage(to: string, message: string): Message {
    return {
        to,
        timestamp: new Date().getTime(),
        message,
    };
}

export async function submitMessage(
    apiConnection: ApiConnection,
    message: Message,
    submitMessageApi: (
        apiConnection: ApiConnection,
        envelop: Envelop,
    ) => Promise<void>,
    prersonalSign: (
        provider: ethers.providers.JsonRpcProvider,
        account: string,
        message: string,
    ) => Promise<any>,
): Promise<void> {
    const seralizedMessage = JSON.stringify(message);

    const envelop: Envelop = {
        message: seralizedMessage,
        signature: await prersonalSign(
            apiConnection.provider as ethers.providers.JsonRpcProvider,
            apiConnection.account as string,
            seralizedMessage,
        ),
    };

    await submitMessageApi(apiConnection, envelop);
}
