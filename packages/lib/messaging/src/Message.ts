import {
    Account,
    DeliveryServiceProfile,
    DeliveryServiceProfileKeys,
    ProfileKeys,
    UserProfile,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import {
    EncryptedPayload,
    KeyPair,
    checkSignature,
    decryptAsymmetric,
    encryptAsymmetric,
    sign,
} from '@dm3-org/dm3-lib-crypto';
import { sha256, stringify } from '@dm3-org/dm3-lib-shared';
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
    message?: string;
    metadata: MessageMetadata;
    attachments?: Attachment[];
    signature: string;
}
export interface Attachment {
    name?: string;
    data: string;
}

export type MessageType =
    | 'NEW'
    | 'DELETE_REQUEST'
    | 'EDIT'
    | 'REPLY'
    | 'REACTION'
    | 'READ_OPENED'
    | 'READ_RECEIVED'
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

/**
 * creates and signs a new message
 * @param to sender ENS name
 * @param from receiver ENS name
 * @param message the message content
 * @param privateKey sender signing key
 * @param type the type of the message,
 * @param attachments URI array of attachments e.g. data URIs
 * @param referenceMessageHash reference to previous message
 */
async function internalCreateMessage(
    to: string,
    from: string,
    message: string,
    privateKey: string,
    type?: MessageType,
    attachments?: Attachment[],
    referenceMessageHash?: string,
): Promise<Message> {
    const messgeWithoutSig: Omit<Message, 'signature'> = {
        message,
        attachments,
        metadata: {
            referenceMessageHash,
            type: type ?? 'NEW',
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

/**
 * creates a new message and signs it
 * @param to sender ENS name
 * @param from receiver ENS name
 * @param message the message content
 * @param privateKey sender signing key
 * @param type the type of the message,
 * @param attachments URI array of attachments e.g. data URIs
 * @param referenceMessageHash reference to previous message
 */
export async function createMessage(
    to: string,
    from: string,
    message: string,
    privateKey: string,
    attachments?: Attachment[],
): Promise<Message> {
    return internalCreateMessage(
        to,
        from,
        message,
        privateKey,
        'NEW',
        attachments,
    );
}

/**
 * creates a delete request message and signs it
 * @param to sender ENS name
 * @param from receiver ENS name
 * @param privateKey sender signing key
 * @param referenceMessageHash reference to previous message
 */
export async function createDeleteRequestMessage(
    to: string,
    from: string,
    privateKey: string,
    referenceMessageHash: string,
): Promise<Message> {
    const messgeWithoutSig: Omit<Message, 'signature'> = {
        metadata: {
            referenceMessageHash,
            type: 'DELETE_REQUEST',
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

/**
 * creats an edit message and signs it
 * @param to sender ENS name
 * @param from receiver ENS name
 * @param message the message content
 * @param privateKey sender signing key
 * @param type the type of the message,
 * @param attachments URI array of attachments e.g. data URIs
 * @param referenceMessageHash reference to previous message
 */
export async function createEditMessage(
    to: string,
    from: string,
    message: string,
    privateKey: string,
    referenceMessageHash: string,
    attachments?: Attachment[],
): Promise<Message> {
    return internalCreateMessage(
        to,
        from,
        message,
        privateKey,
        'EDIT',
        attachments,
        referenceMessageHash,
    );
}

/**
 * creats a reply message and signs it
 * @param to sender ENS name
 * @param from receiver ENS name
 * @param message the message content
 * @param privateKey sender signing key
 * @param type the type of the message,
 * @param attachments URI array of attachments e.g. data URIs
 * @param referenceMessageHash reference to previous message
 */
export async function createReplyMessage(
    to: string,
    from: string,
    message: string,
    privateKey: string,
    referenceMessageHash: string,
    attachments?: Attachment[],
): Promise<Message> {
    return internalCreateMessage(
        to,
        from,
        message,
        privateKey,
        'REPLY',
        attachments,
        referenceMessageHash,
    );
}

/**
 * creats a reaction message and signs it
 * @param to sender ENS name
 * @param from receiver ENS name
 * @param message the message content
 * @param privateKey sender signing key
 * @param type the type of the message,
 * @param attachments URI array of attachments e.g. data URIs
 * @param referenceMessageHash reference to previous message
 */
export async function createReactionMessage(
    to: string,
    from: string,
    message: string,
    privateKey: string,
    referenceMessageHash: string,
): Promise<Message> {
    return internalCreateMessage(
        to,
        from,
        message,
        privateKey,
        'REACTION',
        [],
        referenceMessageHash,
    );
}

/**
 * creats a read opened message and signs it
 * @param to sender ENS name
 * @param from receiver ENS name
 * @param message the message content
 * @param privateKey sender signing key
 * @param referenceMessageHash reference to previous message
 */
export async function createReadOpenMessage(
    to: string,
    from: string,
    message: string,
    privateKey: string,
    referenceMessageHash: string,
): Promise<Message> {
    return internalCreateMessage(
        to,
        from,
        message,
        privateKey,
        'READ_OPENED',
        [],
        referenceMessageHash,
    );
}

/**
 * creates a read received message and signs it
 * @param to sender ENS name
 * @param from receiver ENS name
 * @param message the message content
 * @param privateKey sender signing key
 * @param referenceMessageHash reference to previous message
 */
export async function createReadReceiveMessage(
    to: string,
    from: string,
    message: string,
    privateKey: string,
    referenceMessageHash: string,
): Promise<Message> {
    return internalCreateMessage(
        to,
        from,
        message,
        privateKey,
        'READ_RECEIVED',
        [],
        referenceMessageHash,
    );
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
