import { formatAddress } from '../external-apis/InjectedWeb3API';
import { EncryptionEnvelop } from '../messaging/Messaging';
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
    data: { envelop: EncryptionEnvelop; token: string },
    getSession: (accountAddress: string) => Promise<Session | null>,
    storeNewMessage: (
        conversationId: string,
        envelop: EncryptionEnvelop,
    ) => Promise<void>,
    send: (socketId: string, envelop: EncryptionEnvelop) => void,
): Promise<void> {
    const envelop = {
        ...data.envelop,
        deliveryServiceIncommingTimestamp: new Date().getTime(),
    };
    const account = formatAddress(formatAddress(data.envelop.from));
    const contact = formatAddress(formatAddress(data.envelop.to));
    const conversationId = getConversationId(account, contact);

    if (await checkToken(getSession, account, data.token)) {
        storeNewMessage(conversationId, envelop);
        const contactSession = await getSession(contact);
        if (contactSession?.socketId) {
            send(contactSession.socketId, envelop);
        }
    } else {
        throw Error('Token check failed');
    }
}
