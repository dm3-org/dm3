import { ethers } from 'ethers';
import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { EncryptionEnvelop, Envelop, Message } from '../src/lib/Messaging';
import { checkToken, Session } from './BackendLib';

export function getConversationId(accountA: string, accountB: string): string {
    return [
        ethers.utils.getAddress(accountA),
        ethers.utils.getAddress(accountB),
    ]
        .sort()
        .join();
}

export function incomingMessage(
    data: { envelop: Envelop | EncryptionEnvelop; token: string },
    sessions: Map<string, Session>,
    messages: Map<string, (Envelop | EncryptionEnvelop)[]>,
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    contacts: Map<string, Set<string>>,
) {
    const account = (data.envelop as EncryptionEnvelop).encryptionVersion
        ? ethers.utils.getAddress((data.envelop as EncryptionEnvelop).from)
        : JSON.parse((data.envelop as Envelop).message).from;

    const contact = (data.envelop as EncryptionEnvelop).encryptionVersion
        ? ethers.utils.getAddress((data.envelop as EncryptionEnvelop).to)
        : JSON.parse((data.envelop as Envelop).message).to;
    const conversationId = getConversationId(account, contact);
    console.log(`- Conversations id: ${conversationId}`);
    addContact(contacts, contact, account);

    if (checkToken(sessions, account, data.token)) {
        const conversation = (
            messages.has(conversationId) ? messages.get(conversationId) : []
        ) as (Envelop | EncryptionEnvelop)[];

        conversation.push(data.envelop);

        if (!messages.has(conversationId)) {
            messages.set(conversationId, conversation);
        }

        const contactSession = sessions.get(contact);
        if (contactSession?.socketId) {
            console.log(`- Forwarding message to ${contact}`);
            socket.to(contactSession.socketId).emit('message', data.envelop);
        }
    } else {
        throw Error('Token check failed');
    }
}

export function addContact(
    contacts: Map<string, Set<string>>,
    account: string,
    contact: string,
) {
    const accountContacts: Set<string> = (
        contacts.has(account) ? contacts.get(account) : new Set<string>()
    ) as Set<string>;
    accountContacts.add(contact);

    if (!contacts.has(account)) {
        contacts.set(account, accountContacts);
    }
    console.log(`- Added ${contact} to the contact list of ${account}`);
}
