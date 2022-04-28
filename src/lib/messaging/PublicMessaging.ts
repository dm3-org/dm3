import { checkSignature, signWithSignatureKey } from '../encryption/Encryption';
import { Connection } from '../web3-provider/Web3Provider';
import { UserDB } from '../storage/Storage';
import { log } from '../shared/log';
import { Account, Keys } from '../account/Account';
import {
    GetPublicMessage,
    GetPublicMessageHead,
} from '../external-apis/BackendAPI';
import { getAbi, GetAbi, GetTransactions } from '../external-apis/Etherscan';

import { ethers } from 'ethers';
import { getId } from './Utils';
import { formatAddress } from '../external-apis/InjectedWeb3API';

export type TxContainer = {
    timestamp: number;
    tx: ethers.providers.TransactionResponse;
};

export type FeedElment = PublicEnvelop | TxContainer;

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

function filterValidSignature(
    publicEnvelops: PublicEnvelop[],
    contacts: Account[],
) {
    return publicEnvelops.filter((envelop) => {
        const account = contacts.find(
            (contact) =>
                formatAddress(contact.address) ===
                formatAddress(envelop.message.from),
        );
        return account && account.publicKeys?.publicSigningKey
            ? checkSignature(
                  envelop.message,
                  account.publicKeys?.publicSigningKey,
                  account.address,
                  envelop.signature,
              )
            : false;
    });
}

export async function getNewFeedElements(
    existingFeedElements: FeedElment[],
    connection: Connection,
    contacts: Account[],
    abis: Map<string, string>,
    getHead: GetPublicMessageHead,
    getPublicMessage: GetPublicMessage,
    getTransactions: GetTransactions,
) {
    if (!connection.provider) {
        throw Error('No Provider');
    }

    const existingIds = existingFeedElements.map((element) =>
        getFeedElementId(element),
    );

    const addresses = [...contacts.map((account) => account.address)];

    const heads = (
        await Promise.all(addresses.map((address) => getHead(address)))
    )
        .filter((head) => (head ? true : false))
        .filter((head) =>
            existingIds.find((id) => id === head) ? false : true,
        );

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
        .filter((tx) =>
            existingIds.find((id) => id === tx.hash) ? false : true,
        )
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

    const newAbis = (
        await Promise.all(
            txs
                .filter(
                    (txContainer) =>
                        txContainer.tx.to &&
                        txContainer.tx.data.length >= 10 &&
                        !abis.has(formatAddress(txContainer.tx.to)),
                )
                .map(async (txContainer) => ({
                    abiResponse: await getAbi(txContainer.tx.to!),
                    address: txContainer.tx.to!,
                })),
        )
    )
        .filter((abiContainer) => abiContainer.abiResponse.status === '1')
        .map((abiContainer) => ({
            abi: abiContainer.abiResponse.result,
            address: abiContainer.address,
        }));

    const compare = (
        a: TxContainer | PublicEnvelop,
        b: TxContainer | PublicEnvelop,
    ) => getFeedElementTimestamp(b) - getFeedElementTimestamp(a);

    return {
        feedElemements: [
            ...filterValidSignature(
                [...headMessages, ...nonHeadMessages] as PublicEnvelop[],
                contacts,
            ),
            ...txs,
        ].sort((a, b) => compare(a!, b!)) as FeedElment[],
        newAbis: newAbis,
    };
}

export function getFeedElementTimestamp(feedElement: FeedElment) {
    return (feedElement as PublicEnvelop).message
        ? (feedElement as PublicEnvelop).message.timestamp
        : (feedElement as TxContainer).timestamp;
}

export function getFeedElementId(feedElement: FeedElment): string {
    return (feedElement as PublicEnvelop).message
        ? getId(feedElement as PublicEnvelop)
        : (feedElement as TxContainer).tx.hash;
}
