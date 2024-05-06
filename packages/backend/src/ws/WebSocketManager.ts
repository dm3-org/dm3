import { Server, Socket } from 'socket.io';
import http from 'http';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { checkToken } from '@dm3-org/dm3-lib-delivery';
import { IDatabase } from '../persistence/getDatabase';
import { ethers } from 'ethers';

export const UNAUTHORIZED = 'unauthorized';
export const AUTHORIZED = 'authorized';

export class WebSocketManager {
    private readonly connections: Map<string, Socket[]> = new Map();
    private readonly web3Provider: ethers.providers.Web3Provider;
    private readonly db: IDatabase;

    /**
     * @param {http.Server} httpServer - The HTTP server instance.
     * @param {ethers.providers.Web3Provider} web3Provider - ethers web3provider instance.
     * @param {IDatabase} db - The database instance.
     */
    constructor(
        httpServer: http.Server,
        web3Provider: ethers.providers.Web3Provider,
        db: IDatabase,
    ) {
        //Establish Ws
        const server = new Server(httpServer, {
            cors: {
                origin: '*',
            },
        });
        this.web3Provider = web3Provider;
        this.db = db;

        //register listener
        server.on('connection', (c: Socket) => {
            this.addConnection(c);
        });
    }
    /**
     * Checks if a user is connected.
     * @param {string} ensName - The ENS name of the user.
     * @returns {boolean} - Returns true if the user is connected with at least one socket, false otherwise.
     */
    public isConnected(ensName: string) {
        const connections = this.connections.get(ensName);
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
            //Use the already existing function cechkToken to check weather the token matches the provided ensName
            const hasSession = await checkToken(
                this.web3Provider,
                this.db.getSession,
                ensName,
                token,
            );
            //retrive the session from the db
            const session = await this.db.getSession(ensName);
            //If the ensName has not a valid session we disconnect the socket
            if (!hasSession || !session) {
                connection.emit(UNAUTHORIZED);
                connection.disconnect();
            }
            //Get the old connections and add the new one
            const oldConnections = this.connections.get(ensName) || [];
            this.connections.set(ensName, [...oldConnections, connection]);
            //Send the authorized event
            connection.emit(AUTHORIZED);
            //When the socket disconnects we wan't them no longer in our connections List
            connection.on('disconnect', () => {
                this.removeConnection(connection);
            });
        } catch (e) {
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
    private removeConnection(connection: Socket) {
        const ensName = normalizeEnsName(
            connection.handshake.auth.account.ensName,
        );
        const connections = this.connections.get(ensName);
        if (!connections) {
            return;
        }
        const newConnections = connections.filter(
            (c) => c.id !== connection.id,
        );
        this.connections.set(ensName, newConnections);
    }
}
