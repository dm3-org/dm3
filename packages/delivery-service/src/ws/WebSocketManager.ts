import { checkToken } from '@dm3-org/dm3-lib-delivery';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { IWebSocketManager } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { IDatabase } from '../persistence/getDatabase';

export const UNAUTHORIZED = 'unauthorized';
export const AUTHORIZED = 'authorized';

export class WebSocketManager implements IWebSocketManager {
    private readonly connections: Map<string, Socket[]> = new Map();
    private readonly web3Provider: ethers.providers.JsonRpcProvider;
    private readonly db: IDatabase;
    private readonly server: SocketIOServer;
    private readonly serverSecret: string;
    /**
     * @param {http.Server} httpServer - The HTTP server instance.
     * @param {ethers.providers.JsonRpcProvider} web3Provider - ethers JsonRpcProvider instance.
     * @param {IDatabase} db - The database instance.
     */
    constructor(
        server: SocketIOServer,
        web3Provider: ethers.providers.JsonRpcProvider,
        db: IDatabase,
        serverSecret: string,
    ) {
        //Establish Ws
        this.web3Provider = web3Provider;
        this.db = db;
        this.server = server;
        this.serverSecret = serverSecret;

        //register listener
        this.server.on('connection', (c: Socket) => {
            this.addConnection(c);
        });
    }

    /**
     * Checks if a user is connected.
     * @param {string} address - The address of the user.
     * @returns {boolean} - Returns true if the user is connected with at least one socket, false otherwise.
     */
    public async isConnected(address: string) {
        const _address = ethers.utils.getAddress(address);
        const connections = this.connections.get(_address);
        return !!(connections && connections.length > 0);
    }
    /**
     * Adds a new connection to the connections map.
     * @private
     * @param {Socket} connection - The socket connection instance.
     */
    private async addConnection(connection: Socket) {
        try {
            const { account, token } = connection.handshake.auth;

            const ensName = normalizeEnsName(account.ensName);
            //Use the already existing function checkToken to check whether the token matches the provided ensName
            const hasSession = await checkToken(
                this.web3Provider,
                this.db.getAccount,
                ensName,
                token,
                this.serverSecret,
            );
            //retrieve the session from the db
            const session = await this.db.getAccount(ensName);
            //If the ensName has not a valid session we disconnect the socket
            if (!hasSession || !session) {
                console.log('connection refused for ', ensName);
                connection.emit(UNAUTHORIZED);
                connection.disconnect();
                return;
            }
            //Get the old connections and add the new one
            const oldConnections = this.connections.get(session.account) || [];
            this.connections.set(session.account, [
                ...oldConnections,
                connection,
            ]);
            //Send the authorized event
            connection.emit(AUTHORIZED);
            console.log('connection established for ', session.account);
            //When the socket disconnects we want them no longer in our connections List
            connection.on('disconnect', () => {
                console.log('connection closed for ', session.account);
                this.removeConnection(connection);
            });
        } catch (e) {
            console.error(e);
            //If there is an error we disconnect the socket and send the unauthorized event
            connection.emit(UNAUTHORIZED);
            connection.disconnect();
        }
    }
    /**
     * Removes a connection from the connections map.
     * @private
     * @param {Socket} connection - The socket connection instance.
     */
    private async removeConnection(connection: Socket) {
        const ensName = normalizeEnsName(
            connection.handshake.auth.account.ensName,
        );

        //the resolved address for the name
        const address = await this.web3Provider.resolveName(ensName);
        if (!address) {
            console.debug('WS manager,could not resolve address for ', ensName);
            return;
        }
        //the connections the address has created previously
        const connections = this.connections.get(address);

        //if there are no known connections we return
        if (!connections) {
            return;
        }
        //we find the connection that has disconnected and remove it from the list
        const newConnections = connections.filter(
            (c) => c.id !== connection.id,
        );

        //we assign the list conaining all others connections an address might have to the list without the disconnected connection
        this.connections.set(address, newConnections);
    }
}
