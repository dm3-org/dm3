import { Message } from 'dm3-lib-messaging';
import { formatDate } from '../utils/formatter';
import Avatar from './Avatar';

interface Props {
    message: Message;
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
