import http from 'http';
import { Server } from 'socket.io';

export const mockWsServer = async (httpServer: http.Server) => {
    return new Server(httpServer, {
        cors: {
            origin: '*',
        },
    });
};
