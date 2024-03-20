import React from 'react';
import {
    OnNewMessagCallback,
    useWebSocket,
} from '../hooks/webSocket/useWebSocket';
import { Socket } from 'socket.io-client';

export type WebSocketContextType = {
    onNewMessage: (cb: OnNewMessagCallback) => void;
    removeOnNewMessageListener: () => void;
    socket?: Socket;
};

export const WebSocketContext = React.createContext<WebSocketContextType>({
    onNewMessage: (cb: OnNewMessagCallback) => {},
    removeOnNewMessageListener: () => {},
    socket: {} as Socket,
});

export const WebSocketContextProvider = ({ children }: { children?: any }) => {
    const { onNewMessage, removeOnNewMessageListener, socket } = useWebSocket();

    return (
        <WebSocketContext.Provider
            value={{ onNewMessage, removeOnNewMessageListener, socket }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};
