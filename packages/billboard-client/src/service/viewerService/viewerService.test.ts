import { log } from 'dm3-lib-shared';
import { createServer, Server as HttpServerType } from 'http';
import { io as Client, SocketOptions } from 'socket.io-client';
import { ViewerService } from './viewerService';
describe('Viewer Service', () => {
    let client0;
    let client1;
    let client2;
    let httpServer;

    beforeEach(async () => {
        httpServer = await mockHttpServer();
        client0 = await mockNewClient();
        client1 = await mockNewClient();
        client2 = await mockNewClient();
    });

    afterEach(() => {
        httpServer.close();
        client0.close();
        client1.close();
        client2.close();
    });

    describe('viewerCount', () => {
        it('viewerService recognize multipe viewers', async () => {
            const viewerService = ViewerService(httpServer);

            const [socket0IsConnected, socket1IsConnected, socket2IsConnected] =
                await Promise.all([
                    new Promise((res, rej) => {
                        client0.on('connect_error', (err: any) => {
                            rej(false);
                        });

                        client0.on('connect', (_: any) => {
                            res(true);
                        });
                    }),
                    new Promise((res, rej) => {
                        client0.on('connect_error', (err: any) => {
                            rej(false);
                        });

                        client0.on('connect', (_: any) => {
                            res(true);
                        });
                    }),
                    new Promise((res, rej) => {
                        client0.on('connect_error', (err: any) => {
                            rej(false);
                        });

                        client0.on('connect', (_: any) => {
                            res(true);
                        });
                    }),
                ]);

            const viewerCount = viewerService.getViewerCount();

            expect(socket0IsConnected).toBe(true);
            expect(socket1IsConnected).toBe(true);
            expect(socket2IsConnected).toBe(true);
            expect(viewerCount).toBe(3);
        });
        it('disconnected client is no longer counted as viewer', async () => {
            const viewerService = ViewerService(httpServer);

            const [socket0IsConnected, socket1IsConnected, socket2IsConnected] =
                await Promise.all([
                    new Promise((res, rej) => {
                        client0.on('connect_error', (err: any) => {
                            rej(false);
                        });

                        client0.on('connect', (_: any) => {
                            res(true);
                        });
                    }),
                    new Promise((res, rej) => {
                        client0.on('connect_error', (err: any) => {
                            rej(false);
                        });

                        client0.on('connect', (_: any) => {
                            res(true);
                        });
                    }),
                    new Promise((res, rej) => {
                        client0.on('connect_error', (err: any) => {
                            rej(false);
                        });

                        client0.on('connect', (_: any) => {
                            res(true);
                        });
                    }),
                ]);

            expect(socket0IsConnected).toBe(true);
            expect(socket1IsConnected).toBe(true);
            expect(socket2IsConnected).toBe(true);

            let viewerCount = viewerService.getViewerCount();
            await wait(500);
            expect(viewerCount).toBe(3);

            await client0.close();
            //Wait for the callback function
            await wait(100);
            viewerCount = viewerService.getViewerCount();
            expect(viewerCount).toBe(2);
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
const wait = (time: number) => {
    return new Promise<void>((res, rej) => {
        setTimeout(() => {
            res();
        }, time);
    });
};
