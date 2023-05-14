import { Message } from 'dm3-lib-messaging';
import MessageItem from './MessageItem';

export interface MessageWithKey extends Message {
    reactKey: string;
}

export interface IMessagesListProps {
    messages: MessageWithKey[];
}

export default function MessagesList({ messages }: IMessagesListProps) {
    return (
        <div className="">
            <ul className="message-list">
                {messages.map((msgObj) => (
                    <li key={msgObj.reactKey}>
                        <div className="list-container">
                            <MessageItem message={msgObj} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
