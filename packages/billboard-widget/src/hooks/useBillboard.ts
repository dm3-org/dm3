import { getBillboardApiClient } from '@dm3-org/dm3-lib-billboard-client-api';
import { useContext, useEffect, useState } from 'react';

import { Message } from '@dm3-org/dm3-lib-messaging';
import { Socket, io } from 'socket.io-client';
import { GlobalContext } from '../context/GlobalContext';
import useMessages from './useMessages';

const useBillboard = () => {
    const {
        clientProps: { mockedApi, billboardId, billboardClientUrl },
    } = useContext(GlobalContext);
    const { messages, setMessages, addMessage, sendDm3Message } = useMessages();
    const [loading, setLoading] = useState<boolean>(false);
    const [online, setOnline] = useState<boolean>(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const client = getBillboardApiClient({
            mock: !!mockedApi,
            baseURL: billboardClientUrl,
        });

        const getInitialMessages = async () => {
            //Initial message are already fetched
            if (messages.length > 0 || loading || initialized) {
                return;
            }

            setMessages([]);
            setLoading(true);
            const initialMessages = await client.getMessages(
                billboardId,
                Date.now(),
                '0',
            );

            if (initialMessages) {
                setMessages(initialMessages);
            }

            setLoading(false);
            setInitialized(true);
        };
        getInitialMessages();
    }, [
        billboardClientUrl,
        billboardId,
        mockedApi,
        messages,
        setMessages,
        loading,
        initialized,
    ]);

    useEffect(() => {
        if (socket || mockedApi) {
            return;
        }
        const hostname = new URL(billboardClientUrl).hostname;

        const url = hostname;
        setSocket(
            io(url, {
                path: '/bb-client/socket.io',
            }),
        );
    }, [billboardClientUrl, socket, mockedApi]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.onAny((arg: any) => {
            console.log('wildcard');
            console.log(arg);
        });

        socket.on('connect_error', (err: any) => {
            console.log(`connect_error due to ${err.message}`);
        });

        socket.on('connect', function () {
            console.log('socket connect');
            setOnline(true);
        });

        socket.on('disconnect', function () {
            console.log('socket disconnect');
            setOnline(false);
        });

        socket.on(`message-${billboardId}`, function (data: Message) {
            console.log('socket new msg');
            addMessage(data);
        });
        socket.connect();
    }, [addMessage, socket, billboardId]);

    return {
        online,
        loading,
        messages,
        sendDm3Message,
    };
};

export default useBillboard;
