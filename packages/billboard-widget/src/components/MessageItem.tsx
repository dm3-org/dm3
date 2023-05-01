import React from 'react';
import { Message } from 'dm3-lib-messaging';
import { formatDate } from '../utils/formatter';

interface Props {
    message: Message;
}

function Avatar({ identifier }: { identifier: string }) {
    return (
        <div className="avatar">
            <img
                src={`https://robohash.org/${identifier}?size=38x38`}
                alt={`cute robot avatar of dm3 user: ${identifier}`}
            />
        </div>
    );
}

function MessageItem(props: Props) {
    const { message } = props;

    return (
        <div className="container">
            <Avatar identifier={message.metadata.from} />
            <div className="message">
                <div className="content">{message.message}</div>
                <div className="meta">
                    <div className="sender">"{message.metadata.from}"</div>
                    <div className="time">
                        {formatDate(new Date(message.metadata.timestamp))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessageItem;
