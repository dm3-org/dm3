//Interface for an object that manages everything related to WebSocket connections in a single place. This
//can be used to by any component to use the WebSocket connectivity.
//TODO move evything related to WebSocket connection to this interface
export interface IWebSocketManager {
    isConnected(ensName: string): Promise<boolean>;
}
