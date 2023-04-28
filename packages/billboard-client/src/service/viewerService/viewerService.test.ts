import { log } from 'dm3-lib-shared';
import { createServer, Server as HttpServerType } from 'http';
import { io as Client, SocketOptions } from 'socket.io-client';
describe('Viewer Service', () => {
    let io, serverSocket, clientSocket;

    beforeEach(async () => {
        const httpServer = await mockHttpServer();
        serverSocket = await mockNewClient();
    });

    afterEach(() => {
        io.close();
        clientSocket.close();
    });

    it('check', async () => {
        log(io);
        const client0 = await mockNewClient();
        let connEstablished = false;

        await new Promise((res, rej) => {
            client0.on('connect_error', (err: any) => {
                log(err);
                expect(false);
            });

            client0.on('connect', (_: any) => {
                connEstablished = true;
            });
        });
    });
});

const mockHttpServer = async (): Promise<HttpServerType> => {
    const httpServer = createServer();

    await new Promise<boolean>((res, rej) => {
        httpServer.listen(4060, () => {
            res(true);
        });
    });

    return httpServer;
};

const mockNewClient = async (options?: SocketOptions) => {
    //@ts-ignore
    const client = new Client('http://localhost:4060', options);

    return client;
};
