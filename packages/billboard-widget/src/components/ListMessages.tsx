import * as React from 'react';
import { Message } from 'dm3-lib-messaging';
import { useEffect, useRef } from 'react';

export interface IListMessagesProps {
    messages: Message[];
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'short',
        timeStyle: 'medium',
    }).format(date);
}

export default function ListMessages({ messages }: IListMessagesProps) {
    const messagesEndRef = useRef<HTMLBaseElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const isBottom = (el: HTMLBaseElement) => {
        return el.getBoundingClientRect().bottom <= window.innerHeight;
    };

    useEffect(() => {
        if (messagesEndRef.current && isBottom(messagesEndRef.current)) {
            scrollToBottom();
        }
    }, [messages]);

    return (
        <div className="">
            <ul className="messageList">
                {messages.map((msgObj) => (
                    <li>
                        <div className="container">
                            <div className="avatar">
                                <img
                                    src={`https://robohash.org/${msgObj.metadata.from}?size=38x38`}
                                    alt="User Logo"
                                />
                            </div>
                            <div className="message">
                                <div className="content">{msgObj.message}</div>
                                <div className="meta">
                                    <div className="sender">
                                        "{msgObj.metadata.from}"
                                    </div>
                                    <div className="time">
                                        {formatDate(
                                            new Date(msgObj.metadata.timestamp),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            <div ref={messagesEndRef} />
        </div>
    );
}
