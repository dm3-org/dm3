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
            const mockedWeb3Provider = {} as any;
            const mockedDatabase = {} as any;

            new WebSockerManager(
                httpServer,
                mockedWeb3Provider,
                mockedDatabase,
            );
            client0 = await Client('http://localhost:4060');

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
        it('connects authorized socket', async () => {
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
    describe('isConnected', () => {
        it('returns true if name has one session', async () => {
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

            const wsManager = new WebSockerManager(
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
            const isConnected = wsManager.isConnected('bob.eth');
            expect(isConnected).toBe(true);
        });
        it('returns true if name has at least one session', async () => {
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

            const wsManager = new WebSockerManager(
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
            client1 = await Client('http://localhost:4060', {
                auth: {
                    account: {
                        ensName: 'bob.eth',
                    },
                    token: 'token',
                },
            });

            const [socket0IsConnected, socket1IsConnected] = await Promise.all([
                new Promise((res, rej) => {
                    client0.on(UNAUTHORIZED, (err: any) => {
                        rej();
                    });
                    client0.on(AUTHORIZED, (err: any) => {
                        res(true);
                    });
                }),
                new Promise((res, rej) => {
                    client1.on(UNAUTHORIZED, (err: any) => {
                        rej();
                    });
                    client1.on(AUTHORIZED, (err: any) => {
                        res(true);
                    });
                }),
            ]);

            expect(socket0IsConnected).toBe(true);
            expect(socket1IsConnected).toBe(true);
            let isConnected = wsManager.isConnected('bob.eth');
            expect(isConnected).toBe(true);

            client0.close();
            await wait(100);
            isConnected = wsManager.isConnected('bob.eth');
            expect(isConnected).toBe(true);
        });
        it('returns false if name is unknown', async () => {
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

            const wsManager = new WebSockerManager(
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
            const isConnected = wsManager.isConnected('alice.eth');
            expect(isConnected).toBe(false);
        });
        it('keeps track of different independant sessions', async () => {
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

            const wsManager = new WebSockerManager(
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

            client1 = await Client('http://localhost:4060', {
                auth: {
                    account: {
                        ensName: 'alice.eth',
                    },
                    token: 'token',
                },
            });

            client2 = await Client('http://localhost:4060', {
                auth: {
                    account: {
                        ensName: 'vitalik.eth',
                    },
                    token: 'token',
                },
            });

            const [socket0IsConnected, socket1IsConnected, socket2IsConnected] =
                await Promise.all([
                    new Promise((res, rej) => {
                        client0.on(UNAUTHORIZED, (err: any) => {
                            rej();
                        });
                        client0.on(AUTHORIZED, (err: any) => {
                            res(true);
                        });
                    }),
                    new Promise((res, rej) => {
                        client1.on(UNAUTHORIZED, (err: any) => {
                            rej();
                        });
                        client1.on(AUTHORIZED, (err: any) => {
                            res(true);
                        });
                    }),
                    new Promise((res, rej) => {
                        client2.on(UNAUTHORIZED, (err: any) => {
                            rej();
                        });
                        client2.on(AUTHORIZED, (err: any) => {
                            res(true);
                        });
                    }),
                ]);

            expect(socket0IsConnected).toBe(true);
            expect(socket1IsConnected).toBe(true);
            expect(socket2IsConnected).toBe(true);

            expect(await wsManager.isConnected('bob.eth')).toBe(true);
            expect(await wsManager.isConnected('alice.eth')).toBe(true);
            expect(await wsManager.isConnected('vitalik.eth')).toBe(true);

            client1.close();
            await wait(100);
            expect(await wsManager.isConnected('bob.eth')).toBe(true);
            expect(await wsManager.isConnected('alice.eth')).toBe(false);
            expect(await wsManager.isConnected('vitalik.eth')).toBe(true);
        });
        it('returns false after the user has closed all its connections', async () => {
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

            const wsManager = new WebSockerManager(
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
            let isConnected = wsManager.isConnected('bob.eth');
            expect(isConnected).toBe(true);

            client0.close();
            await wait(100);
            isConnected = wsManager.isConnected('bob.eth');
            expect(isConnected).toBe(false);
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
