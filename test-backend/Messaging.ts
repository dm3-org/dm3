import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import * as Lib from '../src/lib';
import { getMessage } from '../src/lib/Messaging';
import { checkToken, Session } from './BackendLib';

export function getConversationId(accountA: string, accountB: string): string {
    return [Lib.formatAddress(accountA), Lib.formatAddress(accountB)]
        .sort()
        .join();
}

export function incomingMessage(
    data: { envelop: Lib.Envelop | Lib.EncryptionEnvelop; token: string },
    sessions: Map<string, Session>,
    messages: Map<string, (Lib.Envelop | Lib.EncryptionEnvelop)[]>,
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    contacts: Map<string, Set<string>>,
) {
    const account = Lib.isEncryptionEnvelop(data.envelop)
        ? Lib.formatAddress(data.envelop.from)
        : getMessage(data.envelop as Lib.Envelop).from;

    const contact = Lib.isEncryptionEnvelop(data.envelop)
        ? Lib.formatAddress(data.envelop.to)
        : getMessage(data.envelop as Lib.Envelop).to;
    const conversationId = getConversationId(account, contact);
    console.log(`- Conversations id: ${conversationId}`);
    addContact(contacts, contact, account);

    if (checkToken(sessions, account, data.token)) {
        const conversation = (
            messages.has(conversationId) ? messages.get(conversationId) : []
        ) as (Lib.Envelop | Lib.EncryptionEnvelop)[];

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
    const formattedAccount = Lib.formatAddress(account);
    const formattedContact = Lib.formatAddress(contact);

    const accountContacts: Set<string> = (
        contacts.has(formattedAccount)
            ? contacts.get(formattedAccount)
            : new Set<string>()
    ) as Set<string>;
    accountContacts.add(formattedContact);

    if (!contacts.has(formattedAccount)) {
        contacts.set(formattedAccount, accountContacts);
    }
    console.log(
        `- Added ${formattedContact} to the contact list of ${formattedAccount}`,
    );
}
