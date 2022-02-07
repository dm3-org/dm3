import { ethers } from 'ethers';
import { checkSignature } from '../external-apis/InjectedWeb3API';
import { ApiConnection } from './Web3Provider';

export interface Message {
    to: string;
    from: string;
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

export function createMessage(
    to: string,
    from: string,
    message: string,
): Message {
    return {
        to,
        from,
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

export async function getMessages(
    apiConnection: ApiConnection,
    contact: string,
    getMessagesApi: (
        apiConnection: ApiConnection,
        contact: string,
    ) => Promise<Envelop[]>,
): Promise<Envelop[]> {
    return (await getMessagesApi(apiConnection, contact)).filter((envelop) =>
        checkSignature(
            envelop.message,
            (JSON.parse(envelop.message) as Message).from,
            envelop.signature,
        ),
    );
}
