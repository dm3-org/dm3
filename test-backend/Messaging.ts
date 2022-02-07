import { ethers } from 'ethers';
import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Envelop, Message } from '../src/lib/Messaging';
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
    data: { envelop: Envelop; token: string },
    sessions: Map<string, Session>,
    messages: Map<string, Envelop[]>,
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) {
    const message: Message = JSON.parse(data.envelop.message);
    const account = ethers.utils.getAddress(message.from);
    const contact = ethers.utils.getAddress(message.to);
    const conversationId = getConversationId(account, contact);
    console.log(`- Conversations id: ${conversationId}`);

    if (checkToken(sessions, account, data.token)) {
        const conversation = (
            messages.has(conversationId) ? messages.get(conversationId) : []
        ) as Envelop[];

        conversation.push(data.envelop as Envelop);

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
