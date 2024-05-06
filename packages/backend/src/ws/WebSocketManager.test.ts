import { io as Client } from 'socket.io-client';
import { createServer, Server as HttpServerType } from 'http';
import { AUTHORIZED, UNAUTHORIZED, WebSockerManager } from './WebSocketManager';
describe('WebSocketManager', () => {
    let client0;
    let client1;
    let client2;
    let httpServer;

    beforeEach(async () => {
        httpServer = await mockHttpServer(4060);
    });

    afterEach(() => {
        httpServer.close();
        if (client0) client0.close();
        if (client1) client1.close();
        if (client2) client2.close();
    });

    describe('Connect', () => {
        it('reject socket with token or ensName', async () => {
            client0 = await Client('http://localhost:4060');
            const mockedWeb3Provider = {} as any;
            const mockedDatabase = {} as any;

            new WebSockerManager(
                httpServer,
                mockedWeb3Provider,
                mockedDatabase,
            );

            const [socket0IsConnected] = await Promise.all([
                new Promise((res, rej) => {
                    client0.on(UNAUTHORIZED, (err: any) => {
                        res(false);
                    });
                }),
            ]);

            expect(socket0IsConnected).toBe(false);
        });
        it('reject socket without session', async () => {
            const mockedWeb3Provider = {} as any;
            const mockedDatabase = {} as any;

            client0 = await Client('http://localhost:4060', {
                auth: {
                    account: {
                        ensName: 'bob.eth',
                    },
                    token: 'token',
                },
            });

            new WebSockerManager(
                httpServer,
                mockedWeb3Provider,
                mockedDatabase,
            );

            const [socket0IsConnected] = await Promise.all([
                new Promise((res, rej) => {
                    client0.on(UNAUTHORIZED, (err: any) => {
                        res(false);
                    });
                }),
            ]);

            expect(socket0IsConnected).toBe(false);
        });
        it('disconnect authorized socket', async () => {
            const mockedWeb3Provider = {
                resolveName: (_: string) => Promise.resolve('0x123'),
            } as any;

            const mockedDatabase = {
                getSession: () =>
                    Promise.resolve({
                        token: 'token',
                        createdAt: new Date().getTime(),
                    }),
            } as any;

            new WebSockerManager(
                httpServer,
                mockedWeb3Provider,
                mockedDatabase,
            );

            client0 = await Client('http://localhost:4060', {
                auth: {
                    account: {
                        ensName: 'bob.eth',
                    },
                    token: 'token',
                },
            });

            const [socket0IsConnected] = await Promise.all([
                new Promise((res, rej) => {
                    client0.on(UNAUTHORIZED, (err: any) => {
                        rej();
                    });
                    client0.on(AUTHORIZED, (err: any) => {
                        res(true);
                    });
                }),
            ]);

            expect(socket0IsConnected).toBe(true);
        });
    });
    describe('Connect', () => {
        it('reject socket with token or ensName', async () => {
            client0 = await Client('http://localhost:4060');
            const mockedWeb3Provider = {} as any;
            const mockedDatabase = {} as any;

            new WebSockerManager(
                httpServer,
                mockedWeb3Provider,
                mockedDatabase,
            );

            const [socket0IsConnected] = await Promise.all([
                new Promise((res, rej) => {
                    client0.on(UNAUTHORIZED, (err: any) => {
                        res(false);
                    });
                }),
            ]);

            expect(socket0IsConnected).toBe(false);
        });
        it('reject socket without session', async () => {
            const mockedWeb3Provider = {} as any;
            const mockedDatabase = {} as any;

            client0 = await Client('http://localhost:4060', {
                auth: {
                    account: {
                        ensName: 'bob.eth',
                    },
                    token: 'token',
                },
            });

            new WebSockerManager(
                httpServer,
                mockedWeb3Provider,
                mockedDatabase,
            );

            const [socket0IsConnected] = await Promise.all([
                new Promise((res, rej) => {
                    client0.on(UNAUTHORIZED, (err: any) => {
                        res(false);
                    });
                }),
            ]);

            expect(socket0IsConnected).toBe(false);
        });
        it('disconnect authorized socket', async () => {
            const mockedWeb3Provider = {
                resolveName: (_: string) => Promise.resolve('0x123'),
            } as any;

            const mockedDatabase = {
                getSession: () =>
                    Promise.resolve({
                        token: 'token',
                        createdAt: new Date().getTime(),
                    }),
            } as any;

            new WebSockerManager(
                httpServer,
                mockedWeb3Provider,
                mockedDatabase,
            );

            client0 = await Client('http://localhost:4060', {
                auth: {
                    account: {
                        ensName: 'bob.eth',
                    },
                    token: 'token',
                },
            });

            const [socket0IsConnected] = await Promise.all([
                new Promise((res, rej) => {
                    client0.on(UNAUTHORIZED, (err: any) => {
                        rej();
                    });
                    client0.on(AUTHORIZED, (err: any) => {
                        res(true);
                    });
                }),
            ]);

            expect(socket0IsConnected).toBe(true);
        });
    });
});

export async function mockHttpServer(port: number): Promise<HttpServerType> {
    const httpServer = createServer();

    await new Promise<boolean>((res, rej) => {
        httpServer.listen(port, () => {
            res(true);
        });
    });

    return httpServer;
}

export const wait = (time: number) => {
    return new Promise<void>((res, rej) => {
        setTimeout(() => {
            res();
        }, time);
    });
};
