import { getBillboardApiClient } from 'dm3-lib-billboard-api';
import { useContext, useEffect, useState } from 'react';

import { GlobalContext } from '../context/GlobalContext';
import useMessages from './useMessages';
import { Message } from 'dm3-lib-messaging';
import { Socket, io } from 'socket.io-client';

const useBillboard = () => {
    const {
        clientProps: { mockedApi, billboardId, baseUrl },
    } = useContext(GlobalContext);
    const { messages, setMessages, addMessage, sendDm3Message } = useMessages();
    const [loading, setLoading] = useState<boolean>(false);
    const [online, setOnline] = useState<boolean>(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [viewersCount, setViewersCount] = useState<number>(0);

    useEffect(() => {
        const client = getBillboardApiClient({
            mock: !!mockedApi,
            baseURL: baseUrl,
        });

        const getInitialMessages = async () => {
            //Initial message are already fetched
            if (messages.length > 0) {
                return;
            }
            setMessages([]);
            setLoading(true);
            const newMessages = await client.getMessages(billboardId);
            if (newMessages) {
                setMessages(newMessages);
            }
            const viewers = await client.getActiveViewers(billboardId || '');
            setViewersCount(viewers || 0);
            setLoading(false);
        };
        getInitialMessages();
    }, [baseUrl, billboardId, mockedApi, messages, setMessages]);

    useEffect(() => {
        if (!baseUrl || socket) {
            return;
        }
        setSocket(io(baseUrl));

        return () => {
            //socket?.close();
        };
    }, [baseUrl, socket]);

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

        socket.on('message', function (data: Message) {
            addMessage(data);
        });

        socket.on('viewers', function (data: number) {
            setViewersCount(data);
        });
    }, [addMessage, socket]);

    return {
        online,
        loading,
        messages,
        viewersCount,
        sendDm3Message,
    };
};

export default useBillboard;
