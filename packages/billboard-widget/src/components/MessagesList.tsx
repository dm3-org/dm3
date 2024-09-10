import { Message } from '@dm3-org/dm3-lib-messaging';
import { hashMessage } from '../hooks/useMessages';
import MessageItem from './MessageItem';

export interface IMessagesListProps {
    messages: Message[];
}
export default function MessagesList({ messages }: IMessagesListProps) {
    return (
        <div className="">
            <ul className="message-list">
                {messages.map((msgObj) => (
                    <li key={hashMessage(msgObj)}>
                        <div className="list-container">
                            <MessageItem message={msgObj} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
