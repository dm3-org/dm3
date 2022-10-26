import { ethers } from 'ethers';
import stringify from 'safe-stable-stringify';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import {
    encrypt,
    encryptSafely,
    signWithSignatureKey,
} from '../encryption/Encryption';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { EncryptionEnvelop, Envelop, Postmark } from '../messaging/Messaging';
import { getConversationId } from '../storage/Storage';
import { DeliveryServiceProfile } from './Delivery';
import { checkToken, Session } from './Session';

export interface Acknoledgment {
    contactAddress: string;
    messageDeliveryServiceTimestamp: number;
}

// fetch new messages
export async function getMessages(
    loadMessages: (
        conversationId: string,
        offset: number,
        size: number,
    ) => Promise<EncryptionEnvelop[]>,
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

    const messages = receivedMessages.filter(
        (envelop) => formatAddress(envelop.to) === account,
    );

    return messages;
}

// buffer message until delivery and sync acknoledgment
export async function incomingMessage(
    { envelop, token }: { envelop: EncryptionEnvelop; token: string },
    deliveryServiceProfile: DeliveryServiceProfile,
    getSession: (accountAddress: string) => Promise<Session | null>,
    storeNewMessage: (
        conversationId: string,
        envelop: EncryptionEnvelop,
    ) => Promise<void>,
    send: (socketId: string, envelop: EncryptionEnvelop) => void,
): Promise<void> {
    const sender = formatAddress(envelop.from);
    const receiver = formatAddress(envelop.to);
    const conversationId = getConversationId(sender, receiver);

    const tokenIsValid = await checkToken(getSession, sender, token);
    if (!tokenIsValid) {
        //Token is invalid
        throw Error('Token check failed');
    }

    const receiverSession = await getSession(receiver);
    if (receiverSession === null) {
        //TODO how should we handle this case?
        throw Error('unknown session');
    }

    const receiverEncryptionKey =
        receiverSession?.signedUserProfile.profile.publicEncryptionKey;

    const deliveryServiceSigningKey = deliveryServiceProfile.publicSigningKey;

    const envelopWithPostmark: EncryptionEnvelop = {
        ...envelop,
        postmark: addPostmark(
            envelop,
            receiverEncryptionKey,
            deliveryServiceSigningKey,
        ),
    };
    await storeNewMessage(conversationId, envelopWithPostmark);

    if (receiverSession?.socketId) {
        //Client is already connect to the delivery service and the message can be dispatched
        send(receiverSession.socketId, envelopWithPostmark);
    }
}

function addPostmark(
    { encryptedData }: EncryptionEnvelop,
    receiverEncryptionKey: string,
    deliveryServiceSigningKey: string,
): string {
    const postmarkWithoutSig: Omit<Postmark, 'signature'> = {
        messageHash: ethers.utils.hashMessage(encryptedData),
        incommingTimestamp: new Date().getTime(),
    };

    const signature = signPostmark(
        postmarkWithoutSig,
        deliveryServiceSigningKey,
    );

    //Encrypte the signed Postmark and return the ciphertext
    const { ciphertext, nonce, version, ephemPublicKey } = encryptSafely({
        publicKey: receiverEncryptionKey,
        data: { ...postmarkWithoutSig, signature },
        version: 'x25519-xsalsa20-poly1305',
    });

    return stringify({ nonce, version, ciphertext, ephemPublicKey })!;
}

const signPostmark = (p: Omit<Postmark, 'signature'>, signingKey: string) => {
    return ethers.utils.hexlify(
        nacl.sign.detached(
            ethers.utils.toUtf8Bytes(stringify(p)),
            naclUtil.decodeBase64(signingKey as string),
        ),
    );
};
