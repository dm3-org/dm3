import { ethers } from 'ethers';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { signWithSignatureKey } from '../encryption/Encryption';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { EncryptionEnvelop, Envelop, Postmark } from '../messaging/Messaging';
import { getConversationId } from '../storage/Storage';
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

    if (!(await checkToken(getSession, sender, token))) {
        //Token is invalid
        throw Error('Token check failed');
    }

    const envelopWithPostmark: EncryptionEnvelop & Postmark = {
        ...envelop,
        ...createPostmark(envelop),
    };

    await storeNewMessage(conversationId, envelopWithPostmark);

    const receiverSession = await getSession(receiver);
    if (receiverSession?.socketId) {
        //Client is already connect to the delivery service and the message can be dispatched
        send(receiverSession.socketId, envelopWithPostmark);
    }
}

function createPostmark({ encryptedData, to }: EncryptionEnvelop): Postmark {
    const postmarkWithoutSig: Omit<Postmark, 'signature'> = {
        messageHash: ethers.utils.hashMessage(encryptedData),
        incommingTimestamp: new Date().getTime(),
    };

    const signature = sign(postmarkWithoutSig, to);
    return {
        ...postmarkWithoutSig,
        signature,
    };
}

const sign = (p: Omit<Postmark, 'signature'>, receiver: string) => {
    //TODO implement postmark signing properly
    return '123';
};
