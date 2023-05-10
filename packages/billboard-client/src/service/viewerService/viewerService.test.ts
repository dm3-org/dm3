import { io as Client } from 'socket.io-client';
import { mockHttpServer } from '../../../test/helper/mockHttpServer';
import { wait } from '../../../test/helper/utils/wait';
import { ViewerService } from './ViewerService';
describe('Viewer Service', () => {
    let client0;
    let client1;
    let client2;
    let httpServer;

    beforeEach(async () => {
        httpServer = await mockHttpServer(4060);
        client0 = await Client('http://localhost:4060');
        client1 = await Client('http://localhost:4060');
        client2 = await Client('http://localhost:4060');
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

            expect(socket0IsConnected).toBe(true);
            expect(socket1IsConnected).toBe(true);
            expect(socket2IsConnected).toBe(true);

            const viewerCount = viewerService.getViewerCount();
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
                        client1.on('connect_error', (err: any) => {
                            rej(false);
                        });

                        client1.on('connect', (_: any) => {
                            res(true);
                        });
                    }),
                    new Promise((res, rej) => {
                        client2.on('connect_error', (err: any) => {
                            rej(false);
                        });

                        client2.on('connect', (_: any) => {
                            res(true);
                        });
                    }),
                ]);

            expect(socket0IsConnected).toBe(true);
            expect(socket1IsConnected).toBe(true);
            expect(socket2IsConnected).toBe(true);

            await wait(500);
            let viewerCount = viewerService.getViewerCount();
            expect(viewerCount).toBe(3);

            await client0.close();
            //Wait for the callback function
            await wait(500);
            viewerCount = viewerService.getViewerCount();
            expect(viewerCount).toBe(2);
        });
    });
});
