import { useEffect, useState } from 'react';
import { Message } from 'dm3-lib-messaging';
import { getBillboardApiClient } from 'dm3-lib-billboard-api';

import { MessageWithKey } from '../components/MessagesList';
import { getRandomMessage } from '../utils/getRandomMessage';
import useMessages from './useMessages';

const addKey = (msg: Message): MessageWithKey => {
    return {
        ...msg,
        reactKey: `${msg.metadata.timestamp}${msg.metadata.from}${msg.signature}`,
    };
};

export type ClientProps =
    | {
          mockedApi: true;
          billboardId?: string;
          fetchSince?: Date;
          idMessageCursor?: string;
          baseUrl?: string;
      }
    | {
          mockedApi?: false;
          billboardId: string;
          baseUrl: string;
          fetchSince?: Date;
          idMessageCursor?: string;
      };

/**
 *
 * @returns
 */
const useBillboard = ({
    mockedApi,
    billboardId,
    fetchSince,
    idMessageCursor,
    baseUrl,
}: ClientProps) => {
    const { messages, setMessages, addMessage } = useMessages();
    const [loading, setLoading] = useState<boolean>(false);
    const [viewersCount, setViewersCount] = useState<number>(0);

    const reconnectWhenChanged = [
        baseUrl,
        billboardId,
        fetchSince,
        idMessageCursor,
        mockedApi,
    ];

    useEffect(() => {
        const client = getBillboardApiClient({
            mock: mockedApi,
            baseUrl,
        });

        const load = async () => {
            setMessages(null);
            setLoading(true);
            const messages = await client.getMessages(
                billboardId || '',
                fetchSince?.getTime() || Date.now(),
                idMessageCursor || '',
            );
            if (messages) {
                setMessages(messages);
            }
            const viewers = await client.getActiveViewers(billboardId || '');
            setViewersCount(viewers || 0);
            setLoading(false);
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, reconnectWhenChanged);

    useEffect(() => {
        // Create WebSocket connection.
        const socket = new WebSocket(`ws://${baseUrl}`);

        socket.addEventListener('open', function () {
            // Connection opened, TODO: needed?
        });

        socket.addEventListener('message', function (event) {
            addMessage(JSON.parse(event.data));
        });

        return () => {
            socket.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseUrl, addMessage]);

    /**
     * Add a random message only to the UI for testing purposes.
     * @returns
     */
    const addRandomMessage = () => {
        if (!messages || messages.length === 0) {
            setMessages([addKey(getRandomMessage())]);
            return;
        }
        setMessages([...messages, addKey(getRandomMessage())]);
    };

    return {
        loading,
        messages,
        viewersCount,
        addRandomMessage,
    };
};

export default useBillboard;
