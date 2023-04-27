import { Account, ProfileKeys } from 'dm3-lib-profile';
import { sign } from 'dm3-lib-crypto';
import { stringify } from 'dm3-lib-shared';

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
    deliveryServiceEncryptionPubKey: string;
    keys: ProfileKeys;
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
