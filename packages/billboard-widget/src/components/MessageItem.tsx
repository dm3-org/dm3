import { Message } from 'dm3-lib-messaging';

import Avatar from './Avatar';
import MessageFooter from './MessageFooter';

interface Props {
    message: Message;
    dateFormat?: string;
    relativeDate?: boolean;
}

function MessageItem(props: Props) {
    const { message } = props;

    return (
        <div className="item-container">
            <Avatar identifier={message.metadata.from} />
            <div className="message">
                <div className="content text-sm">{message.message}</div>
                <MessageFooter {...message.metadata} />
            </div>
        </div>
    );
}

export default MessageItem;
