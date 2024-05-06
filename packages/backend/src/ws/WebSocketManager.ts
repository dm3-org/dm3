import { Server, Socket } from 'socket.io';
import http from 'http';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { checkToken } from '@dm3-org/dm3-lib-delivery';
import { IDatabase } from '../persistence/getDatabase';
import { ethers } from 'ethers';

export const UNAUTHORIZED = 'unauthorized';
export const AUTHORIZED = 'authorized';

export class WebSockerManager {
    private readonly connections: Map<string, Socket[]> = new Map();
    private readonly web3Provider: ethers.providers.Web3Provider;
    private readonly db: IDatabase;

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

    private async addConnection(connection: Socket) {
        try {
            const { account, token } = connection.handshake.auth;

            const ensName = normalizeEnsName(account.ensName);

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
                console.log('dc');
                connection.emit(UNAUTHORIZED);
                connection.disconnect(true);
            }
            const oldConnections = this.connections.get(ensName) || [];
            this.connections.set(ensName, [...oldConnections, connection]);
            connection.emit(AUTHORIZED);
        } catch (e) {
            connection.emit(UNAUTHORIZED);
            connection.disconnect(true);
        }
        //this.connections.set(connection.id, connection);

        //When the socket disconnects we wan't them no longer in our viewers List
        //CHECK if we can move the ens to the callback function
        connection.on('disconnect', () => {
            //removeConnection(connection);
        });
    }
}
