import axios from 'axios';
import { log } from '../shared/log';
import { EncryptionEnvelop, Envelop } from '../messaging/Messaging';
import { Connection } from '../web3-provider/Web3Provider';
import { SignedProfileRegistryEntry } from '../account/Account';
import { UserDB } from '..';
import { Acknoledgment } from '../delivery';
import { formatAddress } from './InjectedWeb3API';

const PROFILE = (process.env.REACT_APP_BACKEND as string) + '/profile';
const DELIVERY = (process.env.REACT_APP_BACKEND as string) + '/delivery';
const AUTH_SERVICE = (process.env.REACT_APP_BACKEND as string) + '/auth';

function getAxiosConfig(token: string) {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}

export async function getChallenge(accountAddress: string): Promise<string> {
    return (await axios.get(AUTH_SERVICE + `/${formatAddress(accountAddress)}`))
        .data.challenge;
}
export type GetChallenge = typeof getChallenge;

export async function getNewToken(
    accountAddress: string,
    signature: string,
): Promise<string> {
    return (
        await axios.post(AUTH_SERVICE + `/${formatAddress(accountAddress)}`, {
            signature,
        })
    ).data.token;
}
export type GetNewToken = typeof getNewToken;

export async function submitProfileRegistryEntry(
    accountAddress: string,
    signedProfileRegistryEntry: SignedProfileRegistryEntry,
): Promise<string> {
    return (
        await axios.post(
            `${PROFILE}/${accountAddress}`,
            signedProfileRegistryEntry,
        )
    ).data;
}
export type SubmitProfileRegistryEntry = typeof submitProfileRegistryEntry;

export async function submitMessage(
    connection: Connection,
    userDb: UserDB,
    envelop: Envelop | EncryptionEnvelop,
    onSuccess: () => void,
    onError: () => void,
): Promise<void> {
    if (connection.socket) {
        connection.socket.emit(
            'submitMessage',
            {
                envelop,
                token: userDb.deliveryServiceToken,
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
export type SubmitMessage = typeof submitMessage;

export async function syncAcknoledgment(
    connection: Connection,
    acknoledgments: Acknoledgment[],
    userDb: UserDB,
    lastMessagePull: number,
): Promise<void> {
    return axios.post(
        `${DELIVERY}/messages/${
            connection.account!.address
        }/syncAcknoledgment/${lastMessagePull}`,
        { acknoledgments },
        getAxiosConfig(userDb.deliveryServiceToken),
    );
}
export type SyncAcknoledgment = typeof syncAcknoledgment;

export async function createPendingEntry(
    connection: Connection,
    userDb: UserDB,
    accountAddress: string,
    contactAddress: string,
): Promise<void> {
    if (connection.socket) {
        log(`Create pending entry`);
        connection.socket.emit('pendingMessage', {
            accountAddress,
            contactAddress,
            token: userDb.deliveryServiceToken,
        });
    }
}
export type CreatePendingEntry = typeof createPendingEntry;

export async function getNewMessages(
    connection: Connection,
    userDb: UserDB,
    contactAddress: string,
): Promise<EncryptionEnvelop[]> {
    return (
        await axios.get(
            `${DELIVERY}/messages/${
                connection.account!.address
            }/contact/${contactAddress}`,
            getAxiosConfig(userDb.deliveryServiceToken),
        )
    ).data;
}
export type GetNewMessages = typeof getNewMessages;

export async function getPendingConversations(
    connection: Connection,
    userDb: UserDB,
): Promise<string[]> {
    return (
        await axios.get(
            `${DELIVERY}/messages/${connection.account!.address}/pending`,
            getAxiosConfig(userDb.deliveryServiceToken),
        )
    ).data;
}
export type GetPendingConversations = typeof getPendingConversations;

export async function getProfileRegistryEntryOffChain(
    contact: string,
): Promise<SignedProfileRegistryEntry | undefined> {
    try {
        return (await axios.get(`${PROFILE}/${contact}`)).data;
    } catch (e) {
        if ((e as Error).message.includes('404')) {
            return undefined;
        } else {
            throw Error('Unknown API error');
        }
    }
}
export type GetProfileRegistryEntryOffChain =
    typeof getProfileRegistryEntryOffChain;
