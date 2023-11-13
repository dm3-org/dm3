import { Message } from 'dm3-lib-messaging';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { IViewerService } from './IViewerService';
import { logDebug } from 'dm3-lib-shared';

/**
 * Creates and returns an instance of a viewer service that manages viewer connections and message broadcasting.
 *
 * @param httpServer - The HTTP server instance.
 * @returns An instance of a viewer service.
 */
export function ViewerService(httpServer: http.Server): IViewerService {
    //Establish Ws
    const server = new Server(httpServer, {
        cors: {
            origin: '*',
        },
    });
    //Keep track of every viewer
    const connections: Map<string, Socket> = new Map();

    const addConnection = (connection: Socket) => {
        logDebug({
            text: '[ViewerService] connect',
            id: connection.id,
            connectionsSize: connections.size,
        });

        //When the socket disconnects we wan't them no longer in our viewers List
        connection.on('disconnect', () => {
            removeConnection(connection);
        });
        connections.set(connection.id, connection);
    };

    const removeConnection = (connection: Socket) => {
        logDebug({
            text: '[ViewerService] disconnect',
            id: connection.id,
            connectionsSize: connections.size,
        });
        connections.delete(connection.id);
    };

    const getViewerCount = () => {
        logDebug({
            text: '[ViewerService] getViewerCount',
            connectionsSize: connections.size,
        });
        return connections.size;
    };

    const broadcastMessage = async (idBillboard: string, message: Message) => {
        connections.forEach((connection) => {
            connection.emit(`message-${idBillboard}`, message);
        });
    };

    //Register listener
    server.on('connection', addConnection);
    server.on('disconnect', removeConnection);

    return { getViewerCount, broadcastMessage };
}
