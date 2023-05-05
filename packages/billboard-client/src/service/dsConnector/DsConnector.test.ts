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
                createMessage: (id: string, msg: Message) => {
                    console.log("MSSSSG");
                    return Promise.resolve();
                },
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
        beforeEach(async () => {
            aliceProfile = await mockUserProfile(
                ethers.Wallet.createRandom(),
                'alice.eth',
                ['ds1.eth'],
            );
        });
        it.only('stores incomming messages from ws', async () => {
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
            //Ws is now ready to deal with incoming messages
            await connect();
            const messageFactory = MockMessageFactory({
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
            messageFactory.createMessage('hello');
            ds1WsServer.emit('message', messageFactory.createMessage('hello'));
            // ds1WsServer.emit('message', messageFactory.sendMessage('world'));
            await disconnect();
        });
    });
});

interface MockChatArgs {
    sender: {
        ensName: string;
        signedUserProfile: SignedUserProfile;
        profileKeys: ProfileKeys;
    };
    receiver: {
        ensName: string;
        signedUserProfile: SignedUserProfile;
        profileKeys: ProfileKeys;
    };
    dsKey: string;
}
const MockMessageFactory = ({ sender, receiver, dsKey }: MockChatArgs) => {
    const sendMessage = async (msg: string) => {
        const message: Message = {
            message: msg,
            metadata: {
                to: receiver.ensName,
                from: sender.ensName,
                timestamp: Date.now(),
                type: 'NEW',
            },
            signature: '',
        };
        const sendDependencies: SendDependencies = {
            from: {
                ensName: sender.ensName,
                profile: sender.signedUserProfile.profile,
                profileSignature: sender.signedUserProfile.signature,
            },
            to: {
                ensName: receiver.ensName,
                profile: receiver.signedUserProfile.profile,
                profileSignature: receiver.signedUserProfile.signature,
            },
            deliveryServiceEncryptionPubKey: dsKey,
            keys: sender.profileKeys,
        };
        console.log('BUILD ENV');
        console.log(message);
        console.log(sendDependencies);

        const { encryptedEnvelop } = await buildEnvelop(
            message,
            encryptAsymmetric,
            sendDependencies,
        );
        return encryptedEnvelop;
    };
    return {
        createMessage: sendMessage,
    };
};
