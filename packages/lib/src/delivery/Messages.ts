import { ethers } from 'ethers';
import stringify from 'safe-stable-stringify';

import {
    decryptAsymmetric,
    encryptAsymmetric,
    EncryptedPayload,
    KeyPair,
    sign,
} from '../crypto';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { DeliveryInformation, EncryptionEnvelop, Postmark } from '../messaging';
import { sha256 } from '../shared/sha256';
import { isSpam } from '../spam-filter';
import { getConversationId } from '../storage/Storage';
import { checkToken, Session } from './Session';

export interface Acknoledgment {
    contactAddress: string;
    messageDeliveryServiceTimestamp: number;
}

export interface MessageSubmission {
    token: string;
    envelop: EncryptionEnvelop;
}

// fetch new messages
export async function getMessages(
    loadMessages: (
        conversationId: string,
        offset: number,
        size: number,
    ) => Promise<EncryptionEnvelop[]>,
    encryptionKeyPair: KeyPair,
    accountAddress: string,
    contactAddress: string,
) {
    const account = formatAddress(accountAddress);
    const contact = formatAddress(contactAddress);
    const conversationId = getConversationId(contact, account);

    const receivedMessages: EncryptionEnvelop[] = await loadMessages(
        conversationId,
        0,
        50,
    );

    const envelopContainers = await Promise.all(
        receivedMessages.map(async (envelop) => ({
            to: formatAddress(
                JSON.parse(
                    await decryptAsymmetric(
                        encryptionKeyPair,
                        JSON.parse(
                            envelop.metadata.deliveryInformation as string,
                        ),
                    ),
                ).to,
            ),
            envelop,
        })),
    );

    return envelopContainers
        .filter((envelopContainer) => envelopContainer.to === account)
        .map((envelopContainer) => envelopContainer.envelop);
}

/**
 * Handles an incomming message.
 * Either stores the message or sends it directly to the receiver if a socketId is provided
 * In order to be considered valid a incoming message has to meet the following criterias
 * 1. The message size must be lower than the sizeLimit specified by the deliveryService {@see messageIsToLarge}
 * 2. The DeliveryServiceToken used by the sender has to be valid
 * 3. The receiver has to have a session at the deliveryService
 * 4. The message must pass every {@see SpamFilterRule} the receiver declared
 */
export async function incomingMessage(
    { envelop, token }: { envelop: EncryptionEnvelop; token: string },
    signingKeyPair: KeyPair,
    encryptionKeyPair: KeyPair,
    sizeLimit: number,
    getSession: (accountAddress: string) => Promise<Session | null>,
    storeNewMessage: (
        conversationId: string,
        envelop: EncryptionEnvelop,
    ) => Promise<void>,
    send: (socketId: string, envelop: EncryptionEnvelop) => void,
    provider: ethers.providers.BaseProvider,
): Promise<void> {
    //Checks the size of the incoming message
    if (messageIsToLarge(envelop, sizeLimit)) {
        throw Error('Message is too large');
    }
    //Decryptes the encrypted DeliveryInformation with the KeyPair of the deliveryService
    const deliveryInformation: DeliveryInformation = JSON.parse(
        await decryptAsymmetric(
            encryptionKeyPair,
            JSON.parse(envelop.metadata.deliveryInformation as string),
        ),
    );

    const conversationId = getConversationId(
        deliveryInformation.from,
        deliveryInformation.to,
    );
    //Checks if the sender is authenticated
    const tokenIsValid = await checkToken(
        getSession,
        deliveryInformation.from,
        token,
    );
    if (!tokenIsValid) {
        //Token is invalid
        throw Error('Token check failed');
    }
    //Retrives the session of the receiver
    const receiverSession = await getSession(deliveryInformation.to);
    if (!receiverSession) {
        throw Error('unknown session');
    }
    //Checkes if the message is spam
    if (await isSpam(provider, receiverSession, deliveryInformation)) {
        throw Error('Message does not match spam criteria');
    }

    if (await isSpam(provider, receiverSession, deliveryInformation)) {
        throw Error('Message does not match spam criteria');
    }

    const receiverEncryptionKey =
        receiverSession.signedUserProfile.profile.publicEncryptionKey;

    const envelopWithPostmark: EncryptionEnvelop = {
        ...envelop,
        postmark: stringify(
            await addPostmark(
                envelop,
                receiverEncryptionKey,
                signingKeyPair.privateKey,
            ),
        ),
    };
    await storeNewMessage(conversationId, envelopWithPostmark);

    //If there is currently a webSocket connection open to the receiver, the message will be directly send.
    if (receiverSession.socketId) {
        //Client is already connect to the delivery service and the message can be dispatched
        send(receiverSession.socketId, envelopWithPostmark);
    }
}

function messageIsToLarge(
    envelop: EncryptionEnvelop,
    sizeLimit: number,
): boolean {
    return Buffer.byteLength(JSON.stringify(envelop), 'utf-8') > sizeLimit;
}

async function addPostmark(
    { message }: EncryptionEnvelop,
    receiverEncryptionKey: string,
    deliveryServiceSigningKey: string,
): Promise<EncryptedPayload> {
    const postmarkWithoutSig: Omit<Postmark, 'signature'> = {
        messageHash: ethers.utils.hashMessage(stringify(message)),
        incommingTimestamp: new Date().getTime(),
    };

    const signature = await signPostmark(
        postmarkWithoutSig,
        deliveryServiceSigningKey,
    );

    //Encrypte the signed Postmark and return the ciphertext
    const { ciphertext, nonce, ephemPublicKey } = await encryptAsymmetric(
        receiverEncryptionKey,
        stringify({ ...postmarkWithoutSig, signature })!,
    );

    return {
        nonce,
        ciphertext,
        ephemPublicKey,
    };
}

function signPostmark(
    p: Omit<Postmark, 'signature'>,
    signingKey: string,
): Promise<string> {
    const postmarkHash = sha256(stringify(p));
    return sign(signingKey, postmarkHash);
}
