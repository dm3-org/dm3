import { Socket } from 'socket.io';

export function startViewerService() {
    const connections: Map<string, Socket> = new Map();

    const addNewConnection = (connection: Socket) => {
        connections.set(connection.id, connection);
    };

    const removeConnection = (connection: Socket) => {
        connections.delete(connection.id);
    };

    const getViewerCount = () => {
        return connections.size;
    };

    return { addNewConnection, removeConnection,  };
}
