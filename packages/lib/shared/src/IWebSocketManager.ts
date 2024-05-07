export interface IWebSocketManager {
    isConnected(ensName: string): Promise<boolean>;
}
