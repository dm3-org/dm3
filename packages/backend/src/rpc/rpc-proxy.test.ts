import { Axios } from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import request from 'supertest';
import RpcProxy from './rpc-proxy';
import * as testData from './rpc-proxy.test.json';

import * as Lib from 'dm3-lib/dist.backend';

// eslint-disable-next-line no-console
const log = (toLog: any) => console.log(toLog);

const logger = {
    warn: log,
    info: log,
    error: log,
};

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const RECEIVER_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

const keyPair = Lib.crypto.createKeyPair();

describe('rpc-Proxy', () => {
    describe('routing', () => {
        const keysA = {
            encryptionKeyPair: {
                publicKey: 'eHmMq29FeiPKfNPkSctPuZGXvV0sKeO/KZkX2nXvMgw=',
                privateKey: 'pMI77F2w3GK+omZCB4A61WDqISOOnWGXR2f/MTLbqbY=',
            },
            signingKeyPair: {
                publicKey: '+tkDQWZfv9ixBmObsf8tgTHTZajwAE9muTtFAUj2e9I=',
                privateKey:
                    '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJX62QNBZl+/2LEGY5ux/y2BMdNlqPAAT2a5O0UBSPZ70g==',
            },
            storageEncryptionKey:
                '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=',
            storageEncryptionNonce: 0,
        };

        it('Should route non-dm3 related messages to the rpc node', async () => {
            const mockPost = jest.fn((url: string, body: any) => {
                return Promise.resolve({ data: 'Forwarded' });
            });
            const axiosMock = {
                post: mockPost,
            } as Partial<Axios>;

            const app = express();
            app.use(bodyParser.json());
            app.use(RpcProxy(axiosMock as Axios));

            app.locals = {
                logger,
            };

            const { body } = await request(app)
                .post('/')
                .send({
                    jsonrpc: '2.0',
                    method: 'eth_getBlockByHash',
                    params: [
                        '0xdc0818cf78f21a8e70579cb46a43643f78291264dda342ae31049421c82d21ae',
                        false,
                    ],
                    id: 1,
                });

            expect(body).toBe('Forwarded');
            expect(mockPost).toBeCalled();

            return;
        });
        it('Should handle dm3_submitMessage', async () => {
            const mockPost = jest.fn((url: string, body: any) => {
                return Promise.reject('Should not have been invoked');
            });
            const axiosMock = {
                post: mockPost,
            } as Partial<Axios>;

            const app = express();
            app.use(bodyParser.json());
            app.use(RpcProxy(axiosMock as Axios));

            app.locals = {
                logger,
                keys: {
                    signing: keysA.signingKeyPair,
                    encryption: keysA.encryptionKeyPair,
                },
                deliveryServiceProperties: { sizeLimit: 2 ** 14 },

                loadSession: getSession,
                redisClient: {
                    zAdd: () => {},
                },
                db: {
                    createMessage: () => {},
                    getSession,
                },
                io: {
                    sockets: {
                        to: (_: any) => ({
                            emit: (_: any, __any: any) => {},
                        }),
                    },
                },
            };

            const { status } = await request(app)
                .post('/')
                .send({
                    jsonrpc: '2.0',
                    method: 'dm3_submitMessage',
                    params: [
                        JSON.stringify({
                            message: '',
                            metadata: {
                                deliveryInformation: Lib.stringify(
                                    testData.deliveryInformation,
                                ),
                                signature: '',
                                encryptedMessageHash: '',
                                version: '',
                                encryptionScheme: 'x25519-chacha20-poly1305',
                            },
                        }),
                        '123',
                    ],
                });

            expect(mockPost).not.toBeCalled();
            expect(status).toBe(200);
        });

        it('Should handle dm3_getDeliveryServiceProperties', async () => {
            const mockPost = jest.fn((url: string, body: any) => {
                return Promise.reject('Should not have been invoked');
            });
            const axiosMock = {
                post: mockPost,
            } as Partial<Axios>;

            const app = express();
            app.use(bodyParser.json());
            app.use(RpcProxy(axiosMock as Axios));

            app.locals = {
                logger,
                deliveryServiceProperties: { messageTTL: 0, sizeLimit: 0 },
            };

            const { status, body } = await request(app).post('/').send({
                jsonrpc: '2.0',
                method: 'dm3_getDeliveryServiceProperties',
                params: [],
            });

            expect(mockPost).not.toBeCalled();
            expect(status).toBe(200);
            expect(body).toStrictEqual({
                jsonrpc: '2.0',
                result: JSON.stringify({
                    messageTTL: 0,
                    sizeLimit: 0,
                }),
            });
        });

        it('Should return 400 if method is undefined', async () => {
            const mockPost = jest.fn((url: string, body: any) => {
                return Promise.reject('Should not have been invoked');
            });
            const axiosMock = {
                post: mockPost,
            } as Partial<Axios>;

            const app = express();
            app.use(bodyParser.json());
            app.use(RpcProxy(axiosMock as Axios));

            const { status } = await request(app).post('/');

            expect(mockPost).not.toBeCalled();
            expect(status).toBe(400);

            return;
        });
    });

    describe('resolveProfileExtension', () => {
        it('return 400 if ens-name is not linked to an address', async () => {
            const mockPost = jest.fn((url: string, body: any) => {
                return Promise.reject('Should not have been invoked');
            });
            const axiosMock = {
                post: mockPost,
            } as Partial<Axios>;

            const app = express();
            app.use(bodyParser.json());
            app.use(RpcProxy(axiosMock as Axios));

            app.locals = {
                logger,
                web3Provider: {
                    resolveName: (_: string) => Promise.resolve(null),
                },
            };

            const { status, body } = await request(app)
                .post('/')
                .send({
                    jsonrpc: '2.0',
                    method: 'dm3_getProfileExtension',
                    params: ['unknown.eth'],
                });

            expect(mockPost).not.toBeCalled();
            expect(status).toBe(400);
            expect(body).toStrictEqual({
                error: 'unknown ens-name',
            });
        });
        it('return 400 if user is unknown', async () => {
            const mockPost = jest.fn((url: string, body: any) => {
                return Promise.reject('Should not have been invoked');
            });
            const axiosMock = {
                post: mockPost,
            } as Partial<Axios>;

            const app = express();
            app.use(bodyParser.json());
            app.use(RpcProxy(axiosMock as Axios));

            app.locals = {
                logger,
                web3Provider: {
                    resolveName: (_: string) =>
                        Promise.resolve(RECEIVER_ADDRESS),
                },
                db: {
                    getSession: (_: string) => Promise.resolve(null),
                },
            };

            const { status, body } = await request(app)
                .post('/')
                .send({
                    jsonrpc: '2.0',
                    method: 'dm3_getProfileExtension',
                    params: ['unknown.eth'],
                });

            expect(mockPost).not.toBeCalled();
            expect(status).toBe(400);
            expect(body).toStrictEqual({
                error: 'unknown user',
            });
        });

        it('return 200 and the profileExtension', async () => {
            const mockPost = jest.fn((url: string, body: any) => {
                return Promise.reject('Should not have been invoked');
            });
            const axiosMock = {
                post: mockPost,
            } as Partial<Axios>;

            const app = express();
            app.use(bodyParser.json());
            app.use(RpcProxy(axiosMock as Axios));

            app.locals = {
                logger,
                web3Provider: {
                    resolveName: (_: string) =>
                        Promise.resolve(RECEIVER_ADDRESS),
                },
                db: {
                    getSession: (_: string) =>
                        Promise.resolve({
                            account: '',
                            signedUserProfile: {
                                profile: {
                                    publicEncryptionKey: '',
                                    publicSigningKey: '',
                                    deliveryServices: '',
                                },
                                signature: '',
                            },
                            token: '',
                            publicMessageHeadUri: '',
                            createdAt: 0,
                            socketId: '',
                            challenge: '',
                            profileExtension: {
                                notSupportedMessageTypes: ['NEW'],
                            },
                        }),
                },
            };

            const { status, body } = await request(app)
                .post('/')
                .send({
                    jsonrpc: '2.0',
                    method: 'dm3_getProfileExtension',
                    params: ['unknown.eth'],
                });

            expect(mockPost).not.toBeCalled();
            expect(status).toBe(200);
            expect(body).toStrictEqual({
                jsonrpc: '2.0',
                result: Lib.stringify({
                    notSupportedMessageTypes: ['NEW'],
                }),
            });
        });
    });
});

const getSession = async (address: string) => {
    const emptyProfile: Lib.account.UserProfile = {
        publicSigningKey: '',
        publicEncryptionKey: '',
        deliveryServices: [''],
    };
    const isSender = Lib.external.formatAddress(address) === SENDER_ADDRESS;
    const isReceiver = Lib.external.formatAddress(address) === RECEIVER_ADDRESS;

    const session = (
        account: string,
        token: string,
        profile: Lib.account.UserProfile,
    ) => ({
        account,
        signedUserProfile: {
            profile,
            signature: '',
        },
        token,
    });

    if (isSender) {
        return session(SENDER_ADDRESS, '123', emptyProfile);
    }

    if (isReceiver) {
        return session(RECEIVER_ADDRESS, 'abc', {
            ...emptyProfile,
            publicEncryptionKey: (await keyPair).publicKey,
        });
    }

    return null;
};
