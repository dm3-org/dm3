import { Message } from 'dm3-lib-messaging';

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Avatar from './Avatar';
import MessageFooter from './MessageFooter';

interface Props {
    message: Message;
    dateFormat?: string;
    relativeDate?: boolean;
}

function MessageItem(props: Props) {
    const { message } = props;
    const { ensName } = useContext(AuthContext);

    const messageStyle =
        'content text-sm ' +
        ' ' +
        (message.metadata.from === ensName ? 'own' : '');

    return (
        <div className="item-container">
            <Avatar identifier={message.metadata.from} />
            <div className="message ">
                <div className={messageStyle}>{message.message}</div>
                <MessageFooter {...message.metadata} />
            </div>
        </div>
    );
}

export default MessageItem;
