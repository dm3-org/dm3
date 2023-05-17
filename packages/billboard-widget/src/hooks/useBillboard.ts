import { getBillboardApiClient } from 'dm3-lib-billboard-api';
import { useContext, useEffect, useState } from 'react';

import { GlobalContext } from '../context/GlobalContext';
import useMessages from './useMessages';

/**
 *
 * @returns
 */
const useBillboard = () => {
    const {
        clientProps: {
            mockedApi,
            billboardId,
            fetchSince,
            idMessageCursor,
            baseUrl,
        },
    } = useContext(GlobalContext);
    const { messages, setMessages, addMessage, sendDm3Message } = useMessages();
    const [loading, setLoading] = useState<boolean>(false);
    const [viewersCount, setViewersCount] = useState<number>(0);

    useEffect(() => {
        const client = getBillboardApiClient({
            mock: !!mockedApi,
            baseUrl,
        });

        const getInitialMessages = async () => {
            //Initial message are already fetched
            if (messages.length > 0) {
                return;
            }
            setMessages([]);
            setLoading(true);
            const newMessages = await client.getMessages(
                billboardId || '',
                fetchSince?.getTime() || Date.now(),
                idMessageCursor || '',
            );
            if (newMessages) {
                setMessages(newMessages);
            }
            const viewers = await client.getActiveViewers(billboardId || '');
            setViewersCount(viewers || 0);
            setLoading(false);
        };
        getInitialMessages();
    }, [
        baseUrl,
        billboardId,
        fetchSince,
        idMessageCursor,
        mockedApi,
        messages,
        setMessages,
    ]);

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
    }, [baseUrl, addMessage]);

    return {
        loading,
        messages,
        viewersCount,
        sendDm3Message,
    };
};

export default useBillboard;
