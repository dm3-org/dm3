import { checkSignature, signWithSignatureKey } from '../encryption/Encryption';
import { Connection } from '../web3-provider/Web3Provider';
import { UserDB } from '../storage/Storage';
import { log } from '../shared/log';
import { Account, Keys } from '../account/Account';
import {
    GetPublicMessage,
    GetPublicMessageHead,
} from '../external-apis/BackendAPI';
import { GetTransactions } from '../external-apis/Etherscan';

import { ethers } from 'ethers';

export type TxContainer = {
    timestamp: number;
    tx: ethers.providers.TransactionResponse;
};

export interface UserFeedManifest {
    previousMessageUris: string[];
}

export interface PublicMessage {
    from: string;
    timestamp: number;
    message: string;
    userFeedManifest: UserFeedManifest;
}

export interface PublicEnvelop {
    message: PublicMessage;
    signature: string;
    id?: string;
}

export async function createPublicMessage(
    messageText: string,
    connection: Connection,
    userDb: UserDB,
    getHead: GetPublicMessageHead,
    getPublicMessage: GetPublicMessage,
    getTimestamp: () => number,
): Promise<PublicEnvelop> {
    log('Create public message');

    if (!connection.account) {
        throw Error('No account');
    }

    const head = await getHead(connection.account.address);
    const prevMessage = head ? await getPublicMessage(head) : null;

    const message: PublicMessage = {
        from: connection.account.address,
        timestamp: getTimestamp(),
        message: messageText,
        userFeedManifest: {
            previousMessageUris:
                prevMessage && head
                    ? [
                          head,
                          ...prevMessage.message.userFeedManifest
                              .previousMessageUris,
                      ]
                    : [],
        },
    };

    return {
        message,
        signature: signWithSignatureKey(message, userDb?.keys as Keys),
    };
}

export async function getFeed(
    connection: Connection,
    contacts: Account[],
    getHead: GetPublicMessageHead,
    getPublicMessage: GetPublicMessage,
    getTransactions: GetTransactions,
) {
    if (!connection.provider) {
        throw Error('No Provider');
    }

    const addresses = [
        ...contacts.map((account) => account.address),
        ...(connection.account ? [connection.account.address] : []),
    ];

    const heads = (
        await Promise.all(addresses.map((address) => getHead(address)))
    ).filter((head) => (head ? true : false));

    const headMessages = (
        await Promise.all(heads.map((head) => getPublicMessage(head!)))
    ).filter((message) => (message ? true : false));

    const nonHeadMessages = (
        await Promise.all(
            headMessages.map((headMessage) =>
                Promise.all(
                    headMessage!.message.userFeedManifest.previousMessageUris.map(
                        (uri) => getPublicMessage(uri),
                    ),
                ),
            ),
        )
    )
        .flat()
        .filter((message) => (message ? true : false));

    const txHashs = (
        await Promise.all(
            addresses.map(async (address) => await getTransactions(address)),
        )
    )
        .filter((tx) => tx.status === '1')
        .map((tx) => tx.result)
        .flat()
        .map((tx) => ({
            hash: tx.hash,
            timestamp: parseInt(tx.timeStamp) * 1000,
        }));

    const txs: TxContainer[] = await Promise.all(
        txHashs.map(async (txHash) => ({
            timestamp: txHash.timestamp,
            tx: await connection.provider!.getTransaction(txHash.hash),
        })),
    );

    const compare = (
        a: TxContainer | PublicEnvelop,
        b: TxContainer | PublicEnvelop,
    ) => {
        const aTimestamp = (a as PublicEnvelop).message
            ? (a as PublicEnvelop).message.timestamp
            : (a as TxContainer).timestamp;
        const bTimestamp = (b as PublicEnvelop).message
            ? (b as PublicEnvelop).message.timestamp
            : (b as TxContainer).timestamp;
        return bTimestamp - aTimestamp;
    };

    return [...headMessages, ...nonHeadMessages, ...txs].sort((a, b) =>
        compare(a!, b!),
    );
}
