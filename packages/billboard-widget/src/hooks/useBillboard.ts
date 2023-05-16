import { useEffect, useState } from 'react';
import { getBillboardApiClient } from 'dm3-lib-billboard-api';
import { io, Socket } from 'socket.io-client';
import useMessages from './useMessages';

export type ClientProps =
    | {
          mockedApi: true;
          billboardId?: string;
          fetchSince?: Date;
          limit?: number;
          websocketUrl?: string;
      }
    | {
          mockedApi?: false;
          billboardId: string;
          websocketUrl: string;
          fetchSince?: Date;
          limit?: number;
      };

/**
 *
 * @returns
 */
const useBillboard = ({
    mockedApi,
    billboardId,
    fetchSince,
    limit,
    websocketUrl,
}: ClientProps) => {
    const { messages, setMessages, addMessage } = useMessages();
    const [loading, setLoading] = useState<boolean>(false);
    const [online, setOnline] = useState<boolean>(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [viewersCount, setViewersCount] = useState<number>(0);

    const reconnectWhenChanged = [
        websocketUrl,
        billboardId,
        fetchSince,
        limit,
        mockedApi,
    ];

    useEffect(() => {
        const client = getBillboardApiClient({
            mock: mockedApi,
            websocketUrl,
        });

        const load = async () => {
            setMessages(null);
            setLoading(true);
            const messages = await client.getMessages(
                billboardId || '',
                fetchSince?.getTime() || Date.now(),
                limit !== undefined ? `${limit}` : '', // TODO: change type to number?
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
        if (!websocketUrl) {
            return;
        }

        setSocket(io(websocketUrl));

        return () => {
            socket?.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [websocketUrl]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on('connect', function () {
            setOnline(true);
        });

        socket.on('disconnect', function () {
            setOnline(false);
        });

        socket.on('message', function (data) {
            addMessage(data);
        });

        socket.on('viewers', function (data) {
            setViewersCount(data);
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addMessage]);

    /**
     * Add a random message only to the UI for testing purposes.
     * @returns
     */
    const addRandomMessage = async () => {
        const { getRandomMessage } = await import('../utils/getRandomMessage');
        const newMessage = getRandomMessage();

        if (!messages || messages.length === 0) {
            setMessages([newMessage]);
            return;
        }

        addMessage(newMessage);
    };

    return {
        online,
        loading,
        messages,
        viewersCount,
        addRandomMessage,
    };
};

export default useBillboard;
