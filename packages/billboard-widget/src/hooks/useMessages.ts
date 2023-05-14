import { useState } from 'react';
import { MessageWithKey } from '../components/MessagesList';

import uniqBy from '../utils/uniqueBy';
import { Message } from 'dm3-lib-messaging';

const addKey = (msg: Message): MessageWithKey => {
    return {
        ...msg,
        reactKey: `${msg.metadata.timestamp}${msg.metadata.from}${msg.signature}`,
    };
};

const useMessages = () => {
    const [messages, _setMessages] = useState<MessageWithKey[] | null>([]);

    /**
     * Add a message to list.
     * Ensure the message has not already ben fetched.
     *
     * @param msg - Message
     */
    const addMessage = (msg: Message) => {
        const messageWithKey = addKey(msg);

        if (messages?.length) {
            _setMessages(
                uniqBy([...(messages || []), messageWithKey], 'reactKey'),
            );

            return;
        }

        _setMessages([messageWithKey]);
    };

    /**
     * Set messages, ensuring they have a unique reactKey property.
     *
     * @param msgs
     */
    const setMessages = (msgs: Message[] | null) => {
        if (messages) {
            _setMessages(msgs?.map(addKey) || null);
        }
    };

    return {
        messages,
        setMessages,
        addMessage,
    };
};

export default useMessages;
