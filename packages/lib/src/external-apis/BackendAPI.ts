import axios from 'axios';
import {
    Account,
    getNamehash,
    normalizeEnsName,
    SignedUserProfile,
} from '../account/Account';
import { Acknoledgment } from '../delivery';
import { getDeliveryServiceClient } from '../delivery/Delivery';
import { EncryptionEnvelop, Envelop } from '../messaging';
import { log } from '../shared/log';
import { Connection } from '../web3-provider/Web3Provider';

const PROFILE_PATH = process.env.REACT_APP_BACKEND + '/profile';
const DELIVERY_PATH = process.env.REACT_APP_BACKEND + '/delivery';
const AUTH_SERVICE_PATH = process.env.REACT_APP_BACKEND + '/auth';

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

export async function getChallenge(
    account: Account,
    connection: Connection,
): Promise<string> {
    const { profile, ensName } = checkAccount(account);

    const url = `${AUTH_SERVICE_PATH}/${normalizeEnsName(ensName)}`;

    const { data } = await getDeliveryServiceClient(
        profile,
        connection,
        async (url) => (await axios.get(url)).data,
    ).get(url);

    return data.challenge;
}
export type GetChallenge = typeof getChallenge;

export async function getNewToken(
    account: Account,
    connection: Connection,
    signature: string,
): Promise<string> {
    const { profile, ensName } = checkAccount(account);

    const url = `${AUTH_SERVICE_PATH}/${normalizeEnsName(ensName)}`;

    const { data } = await getDeliveryServiceClient(
        profile,
        connection,
        async (url) => (await axios.get(url)).data,
    ).post(url, {
        signature,
    });

    return data.token;
}
export type GetNewToken = typeof getNewToken;

export async function submitUserProfile(
    account: Account,
    connection: Connection,
    signedUserProfile: SignedUserProfile,
): Promise<string> {
    const { profile, ensName } = checkAccount(account);

    const url = `${PROFILE_PATH}/${normalizeEnsName(ensName)}`;

    const { data } = await getDeliveryServiceClient(
        profile,
        connection,
        async (url) => (await axios.get(url)).data,
    ).post(url, signedUserProfile);

    return data;
}
export type SubmitUserProfile = typeof submitUserProfile;

export async function submitMessage(
    connection: Connection,
    token: string,
    envelop: Envelop | EncryptionEnvelop,
    onSuccess: () => void,
    onError: () => void,
): Promise<void> {
    if (!connection.socket) {
        return;
    }
    //TODO handle error messages properly
    connection.socket.emit(
        'submitMessage',
        {
            envelop,
            token,
        },
        (response: string) => {
            if (response === 'success') {
                log(`- success`);
                onSuccess();
            } else {
                log(`- error`);
                onError();
            }
        },
    );
}
export type SubmitMessage = typeof submitMessage;

export async function syncAcknoledgment(
    connection: Connection,
    acknoledgments: Acknoledgment[],
    token: string,
    lastMessagePull: number,
): Promise<void> {
    const { account } = connection;
    const { profile } = checkAccount(account);

    const url = `${DELIVERY_PATH}/messages/${normalizeEnsName(
        account!.ensName,
    )}/syncAcknoledgment/${lastMessagePull}`;

    return getDeliveryServiceClient(
        profile,
        connection,
        async (url) => (await axios.get(url)).data,
    ).post(url, { acknoledgments }, getAxiosConfig(token));
}
export type SyncAcknoledgment = typeof syncAcknoledgment;

export async function createPendingEntry(
    connection: Connection,
    token: string,
    accountAddress: string,
    contactAddress: string,
    onSuccess: () => void,
    onError: () => void,
): Promise<void> {
    if (connection.socket) {
        log(`Create pending entry`);
        connection.socket.emit(
            'pendingMessage',
            {
                accountAddress,
                contactAddress,
                token,
            },
            (response: string) => {
                if (response === 'success') {
                    log(`- success`);
                    onSuccess();
                } else {
                    log(`- error`);
                    onError();
                }
            },
        );
    }
}
export type CreatePendingEntry = typeof createPendingEntry;

export async function getNewMessages(
    connection: Connection,
    token: string,
    contactAddress: string,
    baseUrl: string,
): Promise<EncryptionEnvelop[]> {
    const { account } = connection;
    const { profile } = checkAccount(account);

    const url = `${DELIVERY_PATH}/messages/${normalizeEnsName(
        account!.ensName,
    )}/contact/${contactAddress}`;

    const { data } = await getDeliveryServiceClient(
        profile,
        connection,
        async (url) => (await axios.get(url)).data,
    ).get(url, getAxiosConfig(token));

    return data;
}
export type GetNewMessages = typeof getNewMessages;

export async function getPendingConversations(
    connection: Connection,
    token: string,
): Promise<string[]> {
    const { account } = connection;
    const { profile } = checkAccount(account);

    const url = `${DELIVERY_PATH}/messages/${getNamehash(account!)}/pending/`;

    const { data } = await getDeliveryServiceClient(
        profile,
        connection,
        async (url) => (await axios.get(url)).data,
    ).post(url, {}, getAxiosConfig(token));

    return data;
}
export type GetPendingConversations = typeof getPendingConversations;

export async function getUserProfileOffChain(
    connection: Connection,
    account: Account | undefined,
    contact: string,
    url?: string,
): Promise<SignedUserProfile | undefined> {
    try {
        if (url) {
            const { data } = await axios.get(url);
            return data;
        }
        const { profile } = checkAccount(account);

        const fallbackUrl = `${PROFILE_PATH}/${contact}`;

        const { data } = await getDeliveryServiceClient(
            profile,
            connection,
            async (url) => (await axios.get(url)).data,
        ).get(fallbackUrl);
        return data;
    } catch (e) {
        if ((e as Error).message.includes('404')) {
            return undefined;
        } else {
            throw Error('Unknown API error');
        }
    }
}
export type GetUserProfileOffChain = typeof getUserProfileOffChain;
