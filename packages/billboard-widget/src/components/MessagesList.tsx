import { Message } from 'dm3-lib-messaging';
import MessageItem from './MessageItem';
import { v4 as uuid } from 'uuid';



export interface IMessagesListProps {
    messages: Message[];
}
export default function MessagesList({ messages }: IMessagesListProps) {
    return (
        <div className="">
            <ul className="message-list">
                {messages.map((msgObj) => (
                    <li key={uuid()}>
                        <div className="list-container">
                            <MessageItem message={msgObj} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
