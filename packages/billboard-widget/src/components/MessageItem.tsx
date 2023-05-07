import { Message } from 'dm3-lib-messaging';
import { format, formatRelative } from 'date-fns';
import Avatar from './Avatar';
import { useMemo } from 'react';

interface Props {
    message: Message;
    dateFormat: string;
    relativeDate: boolean;
}

function MessageItem(props: Props) {
    const { message, dateFormat = 'P', relativeDate = true } = props;

    const formattedDate = useMemo(() => {
        return relativeDate
            ? formatRelative(message.metadata.timestamp, new Date())
            : format(message.metadata.timestamp, dateFormat);
    }, [relativeDate, message.metadata.timestamp, dateFormat]);

    return (
        <div className="container">
            <Avatar identifier={message.metadata.from} />
            <div className="message">
                <div className="content">{message.message}</div>
                <div className="meta">
                    <div className="sender">"{message.metadata.from}"</div>
                    <div className="time">{formattedDate}</div>
                </div>
            </div>
        </div>
    );
}

export default MessageItem;
