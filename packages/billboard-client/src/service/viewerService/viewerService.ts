import http from 'http';
import { Server, Socket } from 'socket.io';

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
        //When the socket disconnects we wan't them no longer in our viewers List
        connection.on('disconnect', () => {
            removeConnection(connection);
        });
        connections.set(connection.id, connection);
    };

    const removeConnection = (connection: Socket) => {
        connections.delete(connection.id);
    };

    const getViewerCount = () => {
        return connections.size;
    };

    //Register listener
    server.on('connection', addConnection);
    server.on('disconnect', removeConnection);

    return { getViewerCount };
}
