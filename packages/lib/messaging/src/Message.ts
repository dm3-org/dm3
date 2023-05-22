import {
    Account,
    DeliveryServiceProfile,
    DeliveryServiceProfileKeys,
    ProfileKeys,
    UserProfile,
    normalizeEnsName,
} from 'dm3-lib-profile';
import {
    EncryptedPayload,
    KeyPair,
    checkSignature,
    decryptAsymmetric,
    encryptAsymmetric,
    sign,
} from 'dm3-lib-crypto';
import { sha256, stringify } from 'dm3-lib-shared';
import { DeliveryInformation, EncryptionEnvelop, Envelop } from './Envelop';
import { ethers } from 'ethers';

export interface MessageMetadata {
    to: string;
    from: string;
    timestamp: number;
    referenceMessageHash?: string;
    replyDeliveryInstruction?: string;
    type: MessageType;
}

export interface Message {
    message: string;
    metadata: MessageMetadata;
    attachments?: string[];
    signature: string;
}

export type MessageType =
    | 'NEW'
    | 'DELETE_REQUEST'
    | 'EDIT'
    | 'REPLY'
    | 'REACTION'
    | 'READ_RECEIPT'
    | 'RESEND_REQUEST';

export interface Postmark {
    messageHash: string;
    incommingTimestamp: number;
    signature: string;
}

export enum MessageState {
    Created,
    Signed,
    Send,
    Read,
    FailedToSend,
}

export interface SendDependencies {
    from: Account;
    to: Account;
    deliverServiceProfile: DeliveryServiceProfile;
    keys: ProfileKeys;
}

export interface JsonRpcRequest<T> {
    jsonrpc: '2.0';
    method: string;
    params: Array<T>;
}

export async function createMessage(
    to: string,
    from: string,
    message: string,
    privateKey: string,
): Promise<Message> {
    const messgeWithoutSig: Omit<Message, 'signature'> = {
        message,
        metadata: {
            type: 'NEW',
            to,
            from,
            timestamp: new Date().getTime(),
        },
    };

    return {
        ...messgeWithoutSig,
        signature: await sign(privateKey, stringify(messgeWithoutSig)),
    };
}

export async function checkMessageSignature(
    message: Message,
    publicSigningKey: string,
    ensName: string,
): Promise<boolean> {
    let messageWithoutSig: Partial<Message> = { ...message };
    delete messageWithoutSig.signature;

    const sigCheck = await checkSignature(
        publicSigningKey,
        stringify(messageWithoutSig)!,
        message.signature,
    );

    return (
        sigCheck &&
        normalizeEnsName(ensName) === normalizeEnsName(message.metadata.from)
    );
}

export function createJsonRpcCallSubmitMessage(
    encryptedEnvelop: EncryptionEnvelop,
    token: string,
): JsonRpcRequest<string> {
    return {
        jsonrpc: '2.0',
        method: 'dm3_submitMessage',
        params: [JSON.stringify(encryptedEnvelop), token],
    };
}

export async function decryptEnvelop(
    encryptedEnvelop: EncryptionEnvelop,
    encryptionKeyPair: KeyPair,
): Promise<Envelop> {
    const message = JSON.parse(
        await decryptAsymmetric(
            encryptionKeyPair,
            JSON.parse(encryptedEnvelop.message),
        ),
    );
    const postmark: Postmark = JSON.parse(
        await decryptAsymmetric(
            encryptionKeyPair,
            JSON.parse(encryptedEnvelop.postmark!),
        ),
    );
    return {
        ...encryptedEnvelop,
        message,
        postmark,
    };
}

export async function handleMessageOnDeliveryService(
    encryptedEnvelop: EncryptionEnvelop,
    deliveryServiceKeys: DeliveryServiceProfileKeys,
    receiverProfile: UserProfile,
): Promise<{
    encryptedEnvelop: Required<EncryptionEnvelop>;
    decryptedDeliveryInformation: DeliveryInformation;
}> {
    const postmark = await addPostmark(
        encryptedEnvelop,
        receiverProfile.publicEncryptionKey,
        deliveryServiceKeys.signingKeyPair.privateKey,
    );
    return {
        encryptedEnvelop: {
            ...encryptedEnvelop,
            postmark: stringify(postmark),
        },
        decryptedDeliveryInformation: await decryptDeliveryInformation(
            encryptedEnvelop,
            deliveryServiceKeys.encryptionKeyPair,
        ),
    };
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

export async function decryptDeliveryInformation(
    encryptedEnvelop: EncryptionEnvelop,
    encryptionKeyPair: KeyPair,
): Promise<DeliveryInformation> {
    return JSON.parse(
        await decryptAsymmetric(
            encryptionKeyPair,
            JSON.parse(encryptedEnvelop.metadata.deliveryInformation as string),
        ),
    );
}

function signPostmark(
    p: Omit<Postmark, 'signature'>,
    signingKey: string,
): Promise<string> {
    const postmarkHash = sha256(stringify(p));
    return sign(signingKey, postmarkHash);
}
