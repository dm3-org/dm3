import { ethers } from 'ethers';
import { IDatabase } from '../../persitance/getDatabase';
import { dsConnector } from './DsConnector';
import { mockUserProfile } from '../../../test/helper/mockUserProfile';
import { mockDeliveryServiceProfile } from '../../../test/helper/mockDeliveryServiceProfile';
import { wait } from '../../../test/helper/utils/wait';
import { UserProfile } from 'dm3-lib-profile';
import axios, { Axios } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { mockHttpServer } from '../../../test/helper/mockHttpServer';
import { createServer, Server as HttpServerType } from 'http';
import { io as Client, SocketOptions } from 'socket.io-client';
import { mockWsServer } from '../../../test/helper/mockWsServer';

describe('DsConnector', () => {
    describe('Establish connection', () => {
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
        beforeEach(async () => {
            billboard1profile = await mockUserProfile(
                ethers.Wallet.createRandom(),
                'billboard1.eth',
                ['ds1.eth', 'ds2.eth', 'ds3.eth'],
            );

            //DS 1
            ds1Profile = await mockDeliveryServiceProfile(
                ethers.Wallet.createRandom(),
                'http://localhost:4060',
            );
            ds1httpServer = await mockHttpServer(4060);
            ds1WsServer = await mockWsServer(ds1httpServer);
            const axiosMock = new MockAdapter(axios);

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
        });

        afterEach(() => {
            ds1httpServer.close();
            ds2httpServer.close();
            ds3httpServer.close();
        });

        it.only('Establish connection for one Billboard with multiple ds connected', async () => {
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
            const db = {} as IDatabase;
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
});
