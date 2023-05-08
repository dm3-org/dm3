import { ethers } from 'ethers';
import { IDatabase } from '../../persitance/getDatabase';
import { dsConnector } from './DsConnector';
import { mockUserProfile } from '../../../test/helper/mockUserProfile';
import { mockDeliveryServiceProfile } from '../../../test/helper/mockDeliveryServiceProfile';
import { wait } from '../../../test/helper/utils/wait';
import { ProfileKeys, SignedUserProfile, UserProfile } from 'dm3-lib-profile';
import axios, { Axios } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { mockHttpServer } from '../../../test/helper/mockHttpServer';
import { createServer, Server as HttpServerType } from 'http';
import { io as Client, SocketOptions } from 'socket.io-client';
import { mockWsServer } from '../../../test/helper/mockWsServer';
import { buildEnvelop, Message, SendDependencies } from 'dm3-lib-messaging';
import { encryptAsymmetric } from 'dm3-lib-crypto';
import { MockMessageFactory } from '../../../test/helper/mockMessageFactory';

describe('DsConnector', () => {
    //HttpServers of the delivery services
    let ds1httpServer: HttpServerType;
    let ds2httpServer: HttpServerType;
    let ds3httpServer: HttpServerType;
    //Billboard 1 profile
    let billboard1profile;
    //Billboard 2 profile
    let billboard2profile;

    //DeliveryService 1 profile
    let ds1Profile;
    //DeliveryService 2 profile
    let ds2Profile;
    //DeliveryService 3 profile
    let ds3Profile;

    //DeliveryService 1 wsSocket client
    let ds1WsServer;
    //DeliveryService 2 wsSocket client
    let ds2WsServer;
    //DeliveryService 3 wsSocket client
    let ds3WsServer;

    //Axios mock to mock the http requests
    let axiosMock;
    beforeEach(async () => {
        billboard1profile = await mockUserProfile(
            ethers.Wallet.createRandom(),
            'billboard1.eth',
            ['ds1.eth', 'ds2.eth', 'ds3.eth'],
        );
        billboard2profile = await mockUserProfile(
            ethers.Wallet.createRandom(),
            'billboard2.eth',
            ['ds1.eth', 'ds2.eth', 'ds3.eth'],
        );

        //DS 1
        ds1Profile = await mockDeliveryServiceProfile(
            ethers.Wallet.createRandom(),
            'http://localhost:4060',
        );
        ds1httpServer = await mockHttpServer(4060);
        ds1WsServer = await mockWsServer(ds1httpServer);
        axiosMock = new MockAdapter(axios);

        axiosMock
            .onGet('http://localhost:4060/auth/billboard1.eth')
            .reply(200, {
                challenge: 'mock-challenge',
            });
        axiosMock
            .onPost('http://localhost:4060/auth/billboard1.eth')
            .reply(200, {
                token: 'mock-token',
            });

        axiosMock
            .onGet('http://localhost:4060/auth/billboard2.eth')
            .reply(200, {
                challenge: 'mock-challenge',
            });
        axiosMock
            .onPost('http://localhost:4060/auth/billboard2.eth')
            .reply(200, {
                token: 'mock-token',
            });

        //DS 2
        ds2Profile = await mockDeliveryServiceProfile(
            ethers.Wallet.createRandom(),
            'http://localhost:4061',
        );
        ds2httpServer = await mockHttpServer(4061);
        ds2WsServer = await mockWsServer(ds2httpServer);

        axiosMock
            .onGet('http://localhost:4061/auth/billboard1.eth')
            .reply(200, {
                challenge: 'mock-challenge',
            });
        axiosMock
            .onPost('http://localhost:4061/auth/billboard1.eth')
            .reply(200, {
                token: 'mock-token',
            });
        axiosMock
            .onGet('http://localhost:4061/auth/billboard2.eth')
            .reply(200, {
                challenge: 'mock-challenge',
            });
        axiosMock
            .onPost('http://localhost:4061/auth/billboard2.eth')
            .reply(200, {
                token: 'mock-token',
            });
        //DS 3
        ds3Profile = await mockDeliveryServiceProfile(
            ethers.Wallet.createRandom(),
            'http://localhost:4062',
        );
        ds3httpServer = await mockHttpServer(4062);
        ds3WsServer = await mockWsServer(ds3httpServer);

        axiosMock
            .onGet('http://localhost:4062/auth/billboard1.eth')
            .reply(200, {
                challenge: 'mock-challenge',
            });
        axiosMock
            .onPost('http://localhost:4062/auth/billboard1.eth')
            .reply(200, {
                token: 'mock-token',
            });
        axiosMock
            .onGet('http://localhost:4062/auth/billboard2.eth')
            .reply(200, {
                challenge: 'mock-challenge',
            });
        axiosMock
            .onPost('http://localhost:4062/auth/billboard2.eth')
            .reply(200, {
                token: 'mock-token',
            });
    });

    afterEach(() => {
        ds1httpServer.close();
        ds2httpServer.close();
        ds3httpServer.close();
    });
    describe('Establish connection DeliveryService Connection', () => {
        it('Establish connection for one Billboard with multiple ds connected', async () => {
            const db = {} as IDatabase;
            const mockProvider = {
                resolveName: () => billboard1profile.address,
                getResolver: (ensName: string) => {
                    if (ensName === 'billboard1.eth') {
                        return {
                            getText: () => billboard1profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds1.eth') {
                        return {
                            getText: () => ds1Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds2.eth') {
                        return {
                            getText: () => ds2Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds3.eth') {
                        return {
                            getText: () => ds3Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    throw new Error('mock provider unknown ensName');
                },
            } as unknown as ethers.providers.JsonRpcProvider;
            const billBoards = [
                {
                    ensName: 'billboard1.eth',
                    privateKey: billboard1profile.privateKey,
                },
            ];

            const { connect, disconnect } = dsConnector(
                db,
                mockProvider,
                billBoards,
            );

            let conn1;
            let conn2;
            let conn3;
            ds1WsServer.on('connect', (cb) => {
                conn1 = true;
            });
            ds2WsServer.on('connect', (cb) => {
                conn2 = true;
            });
            ds3WsServer.on('connect', (cb) => {
                conn3 = true;
            });

            await connect();
            expect(conn1).toBe(true);
            expect(conn2).toBe(true);
            expect(conn3).toBe(true);
            await disconnect();
        });
        it('Throws if billboard has no profile', async () => {
            const db = {} as IDatabase;
            const mockProvider = {
                resolveName: () => billboard1profile.address,
                getResolver: (ensName: string) => {
                    if (ensName === 'billboard1.eth') {
                        return {
                            getText: () => undefined,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds1.eth') {
                        return {
                            getText: () => ds1Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    throw new Error('mock provider unknown ensName');
                },
            } as unknown as ethers.providers.JsonRpcProvider;
            const billBoards = [
                {
                    ensName: 'billboard1.eth',
                    privateKey: billboard1profile.privateKey,
                },
            ];

            await expect(
                dsConnector(db, mockProvider, billBoards).connect(),
            ).rejects.toThrow("Can't get billboard profile for billboard1.eth");
        });
        it('Throws if billboard has invalid profile', async () => {
            const db = {
                createMessage: jest.fn(),
            } as IDatabase;
            const mockProvider = {
                resolveName: () => billboard1profile.address,
                getResolver: (ensName: string) => {
                    if (ensName === 'billboard1.eth') {
                        return {
                            getText: () =>
                                "data:application/json,{'foo':'bar'}",
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds1.eth') {
                        return {
                            getText: () => ds1Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    throw new Error('mock provider unknown ensName');
                },
            } as unknown as ethers.providers.JsonRpcProvider;
            const billBoards = [
                {
                    ensName: 'billboard1.eth',
                    privateKey: billboard1profile.privateKey,
                },
            ];

            await expect(
                dsConnector(db, mockProvider, billBoards).connect(),
            ).rejects.toThrow("Can't get billboard profile for billboard1.eth");
        });
    });

    describe('Store messages', () => {
        //Alice profile
        let aliceProfile;

        //Bob profile
        let bobProfile;

        beforeEach(async () => {
            aliceProfile = await mockUserProfile(
                ethers.Wallet.createRandom(),
                'alice.eth',
                ['ds1.eth', 'ds2.eth'],
            );
            bobProfile = await mockUserProfile(
                ethers.Wallet.createRandom(),
                'bob.eth',
                ['ds2.eth'],
            );
        });
        it('fetch initial messages from ds', async () => {
            const mockCreateMessage = jest.fn();
            const db = {
                createMessage: mockCreateMessage,
            } as IDatabase;
            const mockProvider = {
                resolveName: (ensName: string) => {
                    if (ensName === 'billboard1.eth') {
                        return billboard1profile.address;
                    }
                    if (ensName === 'billboard2.eth') {
                        return billboard2profile.address;
                    }
                },
                getResolver: (ensName: string) => {
                    if (ensName === 'billboard1.eth') {
                        return {
                            getText: () => billboard1profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'billboard2.eth') {
                        return {
                            getText: () => billboard2profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds1.eth') {
                        return {
                            getText: () => ds1Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds2.eth') {
                        return {
                            getText: () => ds2Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds3.eth') {
                        return {
                            getText: () => ds3Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    throw new Error('mock provider unknown ensName');
                },
            } as unknown as ethers.providers.JsonRpcProvider;

            const billBoards = [
                {
                    ensName: 'billboard1.eth',
                    privateKey: billboard1profile.privateKey,
                },
                {
                    ensName: 'billboard2.eth',
                    privateKey: billboard2profile.privateKey,
                },
            ];

            const { connect, disconnect } = dsConnector(
                db,
                mockProvider,
                billBoards,
            );
            const mockChat1 = MockMessageFactory({
                sender: {
                    ensName: 'alice.eth',
                    signedUserProfile: aliceProfile.signedUserProfile,
                    profileKeys: aliceProfile.profileKeys,
                },
                receiver: {
                    ensName: 'billboard1.eth',
                    signedUserProfile: billboard1profile.signedUserProfile,
                    profileKeys: billboard1profile.profileKeys,
                },
                dsKey: ds1Profile.profile.publicEncryptionKey,
            });

            axiosMock
                .onGet('http://localhost:4060/messages/incoming/billboard1.eth')
                .reply(200, [
                    await mockChat1.createMessage('hello'),
                    await mockChat1.createMessage('world'),
                ]);

            //Ws is now ready to deal with incoming messages
            await connect();
            await wait(500);
            expect(mockCreateMessage).toHaveBeenCalledTimes(2);

            expect(mockCreateMessage).toHaveBeenCalledWith(
                'billboard1.eth',
                expect.objectContaining({
                    message: 'hello',
                    metadata: expect.objectContaining({
                        from: 'alice.eth',
                        to: 'billboard1.eth',
                    }),
                }),
            );
            expect(mockCreateMessage).toHaveBeenCalledWith(
                'billboard1.eth',
                expect.objectContaining({
                    message: 'world',
                    metadata: expect.objectContaining({
                        from: 'alice.eth',
                        to: 'billboard1.eth',
                    }),
                }),
            );

            await disconnect();
        });
        it('stores incomming messages from ws', async () => {
            const mockCreateMessage = jest.fn();
            const db = {
                createMessage: mockCreateMessage,
            } as IDatabase;
            const mockProvider = {
                resolveName: (ensName: string) => {
                    if (ensName === 'billboard1.eth') {
                        return billboard1profile.address;
                    }
                    if (ensName === 'billboard2.eth') {
                        return billboard2profile.address;
                    }
                },
                getResolver: (ensName: string) => {
                    if (ensName === 'billboard1.eth') {
                        return {
                            getText: () => billboard1profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'billboard2.eth') {
                        return {
                            getText: () => billboard2profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds1.eth') {
                        return {
                            getText: () => ds1Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds2.eth') {
                        return {
                            getText: () => ds2Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds3.eth') {
                        return {
                            getText: () => ds3Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    throw new Error('mock provider unknown ensName');
                },
            } as unknown as ethers.providers.JsonRpcProvider;

            const billBoards = [
                {
                    ensName: 'billboard1.eth',
                    privateKey: billboard1profile.privateKey,
                },
                {
                    ensName: 'billboard2.eth',
                    privateKey: billboard2profile.privateKey,
                },
            ];

            const { connect, disconnect } = dsConnector(
                db,
                mockProvider,
                billBoards,
            );
            //Ws is now ready to deal with incoming messages
            await connect();
            const mockChat1 = MockMessageFactory({
                sender: {
                    ensName: 'alice.eth',
                    signedUserProfile: aliceProfile.signedUserProfile,
                    profileKeys: aliceProfile.profileKeys,
                },
                receiver: {
                    ensName: 'billboard1.eth',
                    signedUserProfile: billboard1profile.signedUserProfile,
                    profileKeys: billboard1profile.profileKeys,
                },
                dsKey: ds1Profile.profile.publicEncryptionKey,
            });
            const mockChat2 = MockMessageFactory({
                sender: {
                    ensName: 'bob.eth',
                    signedUserProfile: bobProfile.signedUserProfile,
                    profileKeys: bobProfile.profileKeys,
                },
                receiver: {
                    ensName: 'billboard2.eth',
                    signedUserProfile: billboard2profile.signedUserProfile,
                    profileKeys: billboard2profile.profileKeys,
                },
                dsKey: ds2Profile.profile.publicEncryptionKey,
            });

            const ds1Socketes: string[] = [];
            for (const [key] of ds1WsServer.sockets.sockets.entries()) {
                ds1Socketes.push(key);
            }
            const ds2Socketes: string[] = [];
            for (const [key] of ds2WsServer.sockets.sockets.entries()) {
                ds2Socketes.push(key);
            }

            const [billboard1Ds1Socket, billboard2Ds1Socket] = ds1Socketes;
            const [billboard1Ds2Socket, billboard2Ds2Socket] = ds2Socketes;

            ds1WsServer
                .to(billboard1Ds1Socket)
                .emit('message', await mockChat1.createMessage('hello'));
            ds1WsServer
                .to(billboard1Ds1Socket)
                .emit('message', await mockChat1.createMessage('world'));

            ds2WsServer
                .to(billboard2Ds2Socket)
                .emit(
                    'message',
                    await mockChat2.createMessage('hello from bob'),
                );
            //Wait to ensure all async operations are done
            await wait(500);

            expect(mockCreateMessage).toHaveBeenCalledTimes(3);
            expect(mockCreateMessage).toHaveBeenCalledWith(
                'billboard1.eth',
                expect.objectContaining({
                    message: 'hello',
                    metadata: expect.objectContaining({
                        from: 'alice.eth',
                        to: 'billboard1.eth',
                    }),
                }),
            );
            expect(mockCreateMessage).toHaveBeenCalledWith(
                'billboard1.eth',
                expect.objectContaining({
                    message: 'world',
                    metadata: expect.objectContaining({
                        from: 'alice.eth',
                        to: 'billboard1.eth',
                    }),
                }),
            );
            expect(mockCreateMessage).toHaveBeenCalledWith(
                'billboard2.eth',
                expect.objectContaining({
                    message: 'hello from bob',
                    metadata: expect.objectContaining({
                        from: 'bob.eth',
                        to: 'billboard2.eth',
                    }),
                }),
            );

            await disconnect();
        });
        it('dont crash when invalid messages are submitted', async () => {
            const mockCreateMessage = jest.fn();
            const db = {
                createMessage: mockCreateMessage,
            } as IDatabase;
            const mockProvider = {
                resolveName: (ensName: string) => {
                    if (ensName === 'billboard1.eth') {
                        return billboard1profile.address;
                    }
                    if (ensName === 'billboard2.eth') {
                        return billboard2profile.address;
                    }
                },
                getResolver: (ensName: string) => {
                    if (ensName === 'billboard1.eth') {
                        return {
                            getText: () => billboard1profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'billboard2.eth') {
                        return {
                            getText: () => billboard2profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds1.eth') {
                        return {
                            getText: () => ds1Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds2.eth') {
                        return {
                            getText: () => ds2Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds3.eth') {
                        return {
                            getText: () => ds3Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    throw new Error('mock provider unknown ensName');
                },
            } as unknown as ethers.providers.JsonRpcProvider;

            const billBoards = [
                {
                    ensName: 'billboard1.eth',
                    privateKey: billboard1profile.privateKey,
                },
                {
                    ensName: 'billboard2.eth',
                    privateKey: billboard2profile.privateKey,
                },
            ];

            const { connect, disconnect } = dsConnector(
                db,
                mockProvider,
                billBoards,
            );
            //Ws is now ready to deal with incoming messages
            await connect();
            const mockChat1 = MockMessageFactory({
                sender: {
                    ensName: 'alice.eth',
                    signedUserProfile: aliceProfile.signedUserProfile,
                    profileKeys: aliceProfile.profileKeys,
                },
                receiver: {
                    ensName: 'billboard1.eth',
                    signedUserProfile: billboard1profile.signedUserProfile,
                    profileKeys: billboard1profile.profileKeys,
                },
                dsKey: ds1Profile.profile.publicEncryptionKey,
            });

            const ds1Socketes: string[] = [];
            for (const [key] of ds1WsServer.sockets.sockets.entries()) {
                ds1Socketes.push(key);
            }

            const [billboard1Ds1Socket, billboard2Ds1Socket] = ds1Socketes;

            ds1WsServer
                .to(billboard1Ds1Socket)
                .emit('message', 'blblblbergmrtkomgvtrkogmrtkogmtkog');
            ds1WsServer
                .to(billboard1Ds1Socket)
                .emit('message', await mockChat1.createMessage('hello'));
            ds1WsServer
                .to(billboard1Ds1Socket)
                .emit('message', await mockChat1.createMessage('world'));

            //Wait to ensure all async operations are done
            await wait(500);

            expect(mockCreateMessage).toHaveBeenCalledTimes(2);
            expect(mockCreateMessage).toHaveBeenCalledWith(
                'billboard1.eth',
                expect.objectContaining({
                    message: 'hello',
                    metadata: expect.objectContaining({
                        from: 'alice.eth',
                        to: 'billboard1.eth',
                    }),
                }),
            );

            await disconnect();
        });
    });
});
