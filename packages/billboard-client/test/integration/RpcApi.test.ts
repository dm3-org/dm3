import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { ethers } from 'ethers';
import { Server as HttpServerType } from 'http';
import { io as Client } from 'socket.io-client';
import _winston from 'winston';
import { getBillboardClientApp } from '../../src/getBillboardClientApp';
import { getDatabase, getRedisClient } from '../../src/persitance/getDatabase';
import { mockDeliveryServiceProfile } from '../helper/mockDeliveryServiceProfile';
import { mockHttpServer } from '../helper/mockHttpServer';
import { mockUserProfile } from '../helper/mockUserProfile';
import { mockWsServer } from '../helper/mockWsServer';
import { MockMessageFactory } from '../helper/mockMessageFactory';
import { wait } from '../helper/utils/wait';
import { Message } from 'dm3-lib-messaging';

chai.use(chaiHttp);

chai.should();
describe('RpcApi', () => {
    let winston;
    let redis;
    let provider;

    //HttpServers of the delivery services
    let ds1httpServer, ds2httpServer, ds3httpServer: HttpServerType;
    //Billboard 1+2 profile
    let billboard1profile, billboard2profile;

    //DeliveryService 1,2,3 profile
    let ds1Profile, ds2Profile, ds3Profile;

    //DeliveryService 1,2,3 wsSocket client
    let ds1WsServer, ds2WsServer, ds3WsServer;

    //Example User Alice and bob
    let aliceProfile, bobProfile;

    //Axios mock to mock the http requests
    let axiosMock;
    beforeEach(async () => {
        winston = _winston.createLogger();
        redis = await getRedisClient(winston);
        const billboardOwner = ethers.Wallet.createRandom();
        billboard1profile = await mockUserProfile(
            billboardOwner,
            'billboard1.eth',
            ['ds1.eth', 'ds2.eth', 'ds3.eth'],
        );
        billboard2profile = await mockUserProfile(
            billboardOwner,
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

        provider = {
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
    afterEach(async () => {
        ds1httpServer.close();
        ds2httpServer.close();
        ds3httpServer.close();
        await redis.flushDb();
        redis.quit();
    });

    describe('countActiveViewers', () => {
        it('returns success with viewer count', async () => {
            const db = await getDatabase(winston, redis);
            process.env = {
                ...process.env,
                ensNames: JSON.stringify(['billboard1.eth']),
                privateKey: billboard1profile.privateKey,
                mediators: JSON.stringify([]),
                time: '0',
            };

            const { app, disconnect } = await getBillboardClientApp(
                provider,
                db,
                4444,
            );
            const viewer1 = Client('http://localhost:4444');

            const viewer1IsConnected = await new Promise((res, rej) => {
                viewer1.on('connect', () => {
                    res(true);
                });
                viewer1.on('connect_error', (err: any) => {
                    rej(false);
                });
            });

            expect(viewer1IsConnected).toBe(true);

            const res = await chai.request(app).post('/rpc').send({
                jsonrpc: '2.0',
                method: 'dm3_billboard_countActiveViewers',
                params: [],
            });

            expect(res.body.result.viewers).toBe(1);
            await disconnect();
            await viewer1.close();
        });

        it("returns empty viewers list if there aren't any", async () => {
            const db = await getDatabase(winston, redis);

            process.env = {
                ...process.env,
                ensNames: JSON.stringify(['billboard1.eth']),
                privateKey: billboard1profile.privateKey,
                mediators: JSON.stringify([]),
                time: '0',
            };

            const { app, disconnect } = await getBillboardClientApp(
                provider,
                db,
                4444,
            );

            const res = await chai.request(app).post('/rpc').send({
                jsonrpc: '2.0',
                method: 'dm3_billboard_countActiveViewers',
                params: [],
            });

            expect(res.body.result.viewers).toBe(0);
            disconnect();
        });
    });
    describe('getMessages', () => {
        it('return the most recent messages if no params are specified', async () => {
            const db = await getDatabase(winston, redis);
            process.env = {
                ...process.env,
                ensNames: JSON.stringify(['billboard1.eth']),
                privateKey: billboard1profile.privateKey,
                mediators: JSON.stringify([]),
                time: '0',
            };

            const { app, disconnect } = await getBillboardClientApp(
                provider,
                db,
                4444,
            );
            const viewer1 = Client('http://localhost:4444');

            const viewer1IsConnected = await new Promise((res, rej) => {
                viewer1.on('connect', () => {
                    res(true);
                });
                viewer1.on('connect_error', (err: any) => {
                    rej(false);
                });
            });

            expect(viewer1IsConnected).toBe(true);

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

            const [billboard1Ds1Socket] = ds1Socketes;

            ds1WsServer
                .to(billboard1Ds1Socket)
                .emit('message', await mockChat1.createMessage('hello'));
            ds1WsServer
                .to(billboard1Ds1Socket)
                .emit('message', await mockChat1.createMessage('world'));

            await wait(1000);

            const res = await chai
                .request(app)
                .post('/rpc')
                .send({
                    jsonrpc: '2.0',
                    method: 'dm3_billboard_getMessages',
                    params: ['billboard1.eth'],
                });
            expect(res.body.result.messages.length).toBe(2);
            expect(res.body.result.messages[0].message).toBe('hello');
            expect(res.body.result.messages[1].message).toBe('world');

            disconnect();
            await viewer1.close();
        });
        it('return the most recent messages considering the pagination params', async () => {
            const db = await getDatabase(winston, redis);

            process.env = {
                ...process.env,
                ensNames: JSON.stringify(['billboard1.eth']),
                privateKey: billboard1profile.privateKey,
                mediators: JSON.stringify([]),
                time: '0',
            };

            const { app, disconnect } = await getBillboardClientApp(
                provider,
                db,
                4444,
            );
            const viewer1 = Client('http://localhost:4444');

            const viewer1IsConnected = await new Promise((res, rej) => {
                viewer1.on('connect', () => {
                    res(true);
                });
                viewer1.on('connect_error', (err: any) => {
                    rej(false);
                });
            });

            expect(viewer1IsConnected).toBe(true);

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

            const [billboard1Ds1Socket] = ds1Socketes;

            ds1WsServer
                .to(billboard1Ds1Socket)
                .emit('message', await mockChat1.createMessage('msg1'));
            ds1WsServer
                .to(billboard1Ds1Socket)
                .emit('message', await mockChat1.createMessage('msg2'));
            ds1WsServer
                .to(billboard1Ds1Socket)
                .emit('message', await mockChat1.createMessage('msg3'));
            ds1WsServer
                .to(billboard1Ds1Socket)
                .emit('message', await mockChat1.createMessage('msg4'));
            ds1WsServer
                .to(billboard1Ds1Socket)
                .emit('message', await mockChat1.createMessage('msg5'));

            await wait(1000);

            const res = await chai
                .request(app)
                .post('/rpc')
                .send({
                    jsonrpc: '2.0',
                    method: 'dm3_billboard_getMessages',
                    params: ['billboard1.eth'],
                });
            const startTime = res.body.result.messages[2].metadata.timestamp;

            const paginatedRes = await chai
                .request(app)
                .post('/rpc')
                .send({
                    jsonrpc: '2.0',
                    method: 'dm3_billboard_getMessages',
                    params: ['billboard1.eth', startTime, 2],
                });
            expect(paginatedRes.body.result.messages.length).toBe(2);
            expect(paginatedRes.body.result.messages[0].message).toBe('msg2');
            expect(paginatedRes.body.result.messages[1].message).toBe('msg3');

            disconnect();
            await viewer1.close();
        });
        it('fails if params are invalid', async () => {
            const db = await getDatabase(winston, redis);
            process.env = {
                ...process.env,
                ensNames: JSON.stringify(['billboard1.eth']),
                privateKey: billboard1profile.privateKey,
                mediators: JSON.stringify([]),
                time: '0',
            };

            const { app, disconnect } = await getBillboardClientApp(
                provider,
                db,
                4444,
            );
            const viewer1 = Client('http://localhost:4444');

            const viewer1IsConnected = await new Promise((res, rej) => {
                viewer1.on('connect', () => {
                    res(true);
                });
                viewer1.on('connect_error', (err: any) => {
                    rej(false);
                });
            });

            expect(viewer1IsConnected).toBe(true);

            const res1 = await chai
                .request(app)
                .post('/rpc')
                .send({
                    jsonrpc: '2.0',
                    method: 'dm3_billboard_getMessages',
                    params: ['billboard1.eth', 'foo'],
                });

            expect(res1.body.error).toBe('invalid params');

            const res2 = await chai
                .request(app)
                .post('/rpc')
                .send({
                    jsonrpc: '2.0',
                    method: 'dm3_billboard_getMessages',
                    params: ['billboard1.eth', 1, 'foo'],
                });

            expect(res2.body.error).toBe('invalid params');

            disconnect();
            await viewer1.close();
        });
        it('send incoming message to connect viewers', async () => {
            const db = await getDatabase(winston, redis);
            process.env = {
                ...process.env,
                ensNames: JSON.stringify(['billboard1.eth', 'billboard2.eth']),
                privateKey: billboard1profile.privateKey,
                mediators: JSON.stringify([]),
                time: '0',
            };

            const { app, disconnect } = await getBillboardClientApp(
                provider,
                db,
                4444,
            );
            const viewer1 = Client('http://localhost:4444');
            const viewer2 = Client('http://localhost:4444');

            const viewer1IsConnected = await new Promise((res, rej) => {
                viewer1.on('connect', () => {
                    res(true);
                });
                viewer1.on('connect_error', (err: any) => {
                    rej(false);
                });
            });
            const viewer2IsConnected = await new Promise((res, rej) => {
                viewer2.on('connect', () => {
                    res(true);
                });
                viewer2.on('connect_error', (err: any) => {
                    rej(false);
                });
            });

            expect(viewer1IsConnected).toBe(true);
            expect(viewer2IsConnected).toBe(true);

            const ds1Socketes: string[] = [];
            for (const [key] of ds1WsServer.sockets.sockets.entries()) {
                ds1Socketes.push(key);
            }
            const ds2Socketes: string[] = [];
            for (const [key] of ds2WsServer.sockets.sockets.entries()) {
                ds2Socketes.push(key);
            }

            const [billboard1Ds1Socket] = ds1Socketes;
            const [_, billboard2Ds2Socket] = ds2Socketes;

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
                    ensName: 'alice.eth',
                    signedUserProfile: aliceProfile.signedUserProfile,
                    profileKeys: aliceProfile.profileKeys,
                },
                receiver: {
                    ensName: 'billboard2.eth',
                    signedUserProfile: billboard2profile.signedUserProfile,
                    profileKeys: billboard2profile.profileKeys,
                },
                dsKey: ds2Profile.profile.publicEncryptionKey,
            });

            const receivedMessagesViewer1: Message[] = [];
            viewer1.on('message-billboard1.eth', (msg: Message) =>
                receivedMessagesViewer1.push(msg),
            );

            const receivedMessagesViewer2: Message[] = [];
            viewer2.on('message-billboard2.eth', (msg: Message) =>
                receivedMessagesViewer2.push(msg),
            );

            ds1WsServer
                .to(billboard1Ds1Socket)
                .emit('message', await mockChat1.createMessage('hello'));
            ds1WsServer
                .to(billboard1Ds1Socket)
                .emit('message', await mockChat1.createMessage('billboard1'));

            ds2WsServer
                .to(billboard2Ds2Socket)
                .emit('message', await mockChat2.createMessage('hello'));
            ds2WsServer
                .to(billboard2Ds2Socket)
                .emit('message', await mockChat2.createMessage('billboard2'));

            await wait(1000);

            await disconnect();
            await viewer1.close();
            await viewer2.close();

            expect(receivedMessagesViewer1.length).toBe(2);
            expect(receivedMessagesViewer1[0].message).toBe('hello');
            expect(receivedMessagesViewer1[1].message).toBe('billboard1');

            expect(receivedMessagesViewer2.length).toBe(2);
            expect(receivedMessagesViewer2[0].message).toBe('hello');
            expect(receivedMessagesViewer2[1].message).toBe('billboard2');
        }, 10000);
    });
});
