import axios from 'axios';
import { log } from '../shared/log';
import { EncryptionEnvelop, Envelop } from '../messaging/Messaging';
import { Connection } from '../web3-provider/Web3Provider';
import { Account, SignedProfileRegistryEntry } from '../account/Account';
import { UserDB } from '..';
import { Acknoledgment } from '../delivery';
import { formatAddress } from './InjectedWeb3API';

const PROFILE = '/profile';
const DELIVERY = '/delivery';
const AUTH_SERVICE = '/auth';

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

export async function getChallenge(account: Account): Promise<string> {
    const checkedAccount = checkAccount(account);
    return (
        await axios.get(
            checkedAccount.profile.deliveryServiceUrl +
                AUTH_SERVICE +
                `/${formatAddress(checkedAccount.address)}`,
        )
    ).data.challenge;
}
export type GetChallenge = typeof getChallenge;

export async function getNewToken(
    account: Account,
    signature: string,
): Promise<string> {
    const checkedAccount = checkAccount(account);
    return (
        await axios.post(
            checkedAccount.profile.deliveryServiceUrl +
                AUTH_SERVICE +
                `/${formatAddress(checkedAccount.address)}`,
            {
                signature,
            },
        )
    ).data.token;
}
export type GetNewToken = typeof getNewToken;

export async function submitProfileRegistryEntry(
    account: Account,
    signedProfileRegistryEntry: SignedProfileRegistryEntry,
): Promise<string> {
    const checkedAccount = checkAccount(account);
    return (
        await axios.post(
            `${checkedAccount.profile.deliveryServiceUrl + PROFILE}/${
                account.address
            }`,
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
    const checkedAccount = checkAccount(connection.account);
    return axios.post(
        `${checkedAccount.profile.deliveryServiceUrl + DELIVERY}/messages/${
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
    const checkedAccount = checkAccount(connection.account);
    return (
        await axios.get(
            `${checkedAccount.profile.deliveryServiceUrl + DELIVERY}/messages/${
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
    const checkedAccount = checkAccount(connection.account);
    return (
        await axios.post(
            `${checkedAccount.profile.deliveryServiceUrl + DELIVERY}/messages/${
                connection.account!.address
            }/pending`,
            {},
            getAxiosConfig(userDb.deliveryServiceToken),
        )
    ).data;
}
export type GetPendingConversations = typeof getPendingConversations;

export async function getProfileRegistryEntryOffChain(
    account: Account | undefined,
    contact: string,
    url?: string,
): Promise<SignedProfileRegistryEntry | undefined> {
    if (!url) {
        checkAccount(account);
    }
    try {
        return (
            await axios.get(
                url
                    ? url
                    : `${
                          checkAccount(account).profile.deliveryServiceUrl +
                          PROFILE
                      }/${contact}`,
            )
        ).data;
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
