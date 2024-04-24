import { Axios } from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import request from 'supertest';
import { testData } from '../../../../test-data/encrypted-envelops.test';
import RpcProxy from './rpc-proxy';

import { createKeyPair } from '@dm3-org/dm3-lib-crypto';
import { normalizeEnsName, UserProfile } from '@dm3-org/dm3-lib-profile';
import { stringify } from '@dm3-org/dm3-lib-shared';
import winston from 'winston';

global.logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});

const SENDER_NAME = 'alice.eth';
const RECEIVER_NAME = 'bob.eth';

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const RECEIVER_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

const keyPair = createKeyPair();

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
    storageEncryptionKey: '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=',
    storageEncryptionNonce: 0,
};

describe('rpc-Proxy', () => {
    describe('routing', () => {
        it.only('Should block non-dm3 related requests', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(
                RpcProxy(
                    {} as any,
                    {} as any,
                    {} as any,
                    {} as any,
                    {} as any,
                    keysA,
                ),
            );

            const { status, body } = await request(app)
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

            expect(body).toStrictEqual({ error: 'Method not allowed' });
            expect(status).toBe(405);

            return;
        });
        it('Should handle dm3_submitMessage with authentication', async () => {
            const mockPost = jest.fn((url: string, body: any) => {
                return Promise.reject('Should not have been invoked');
            });
            const axiosMock = {
                post: mockPost,
            } as Partial<Axios>;

            const keys = {
                signing: keysA.signingKeyPair,
                encryption: keysA.encryptionKeyPair,
            };
            process.env.SIGNING_PUBLIC_KEY = keys.signing.publicKey;
            process.env.SIGNING_PRIVATE_KEY = keys.signing.privateKey;
            process.env.ENCRYPTION_PUBLIC_KEY = keys.encryption.publicKey;
            process.env.ENCRYPTION_PRIVATE_KEY = keys.encryption.privateKey;
            const deliveryServiceProperties = {
                sizeLimit: 2 ** 14,
                notificationChannel: [],
            };
            const web3Provider = {
                resolveName: async () =>
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            };
            const db = {
                createMessage: () => {},
                getSession,
                getIdEnsName: async (ensName: string) => ensName,
                getUsersNotificationChannels: () => Promise.resolve([]),
            };
            const io = {
                sockets: {
                    to: (_: any) => ({
                        emit: (_: any, __any: any) => {},
                    }),
                },
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(
                RpcProxy(
                    axiosMock as Axios,
                    deliveryServiceProperties as any,
                    io as any,
                    web3Provider as any,
                    db as any,
                    keysA,
                ),
            );

            const { status } = await request(app)
                .post('/')
                .send({
                    jsonrpc: '2.0',
                    method: 'dm3_submitMessage',
                    params: [
                        JSON.stringify({
                            message: '',
                            metadata: {
                                deliveryInformation: stringify(
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

        it('Should handle dm3_submitMessage without authentication', async () => {
            const mockPost = jest.fn((url: string, body: any) => {
                return Promise.reject('Should not have been invoked');
            });
            const axiosMock = {
                post: mockPost,
            } as Partial<Axios>;

            const keys = {
                signing: keysA.signingKeyPair,
                encryption: keysA.encryptionKeyPair,
            };
            process.env.SIGNING_PUBLIC_KEY = keys.signing.publicKey;
            process.env.SIGNING_PRIVATE_KEY = keys.signing.privateKey;
            process.env.ENCRYPTION_PUBLIC_KEY = keys.encryption.publicKey;
            process.env.ENCRYPTION_PRIVATE_KEY = keys.encryption.privateKey;
            const deliveryServiceProperties = {
                sizeLimit: 2 ** 14,
                notificationChannel: [],
            };
            const web3Provider = {
                resolveName: async () =>
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            };
            const db = {
                createMessage: () => {},
                getSession,
                getIdEnsName: async (ensName: string) => ensName,
                getUsersNotificationChannels: () => Promise.resolve([]),
            };
            const io = {
                sockets: {
                    to: (_: any) => ({
                        emit: (_: any, __any: any) => {},
                    }),
                },
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(
                RpcProxy(
                    axiosMock as Axios,
                    deliveryServiceProperties as any,
                    io as any,
                    web3Provider as any,
                    db as any,
                    keysA,
                ),
            );

            const { status } = await request(app)
                .post('/')
                .send({
                    jsonrpc: '2.0',
                    method: 'dm3_submitMessage',
                    params: [
                        JSON.stringify({
                            message: '',
                            metadata: {
                                deliveryInformation: stringify(
                                    testData.deliveryInformation,
                                ),
                                signature: '',
                                encryptedMessageHash: '',
                                version: '',
                                encryptionScheme: 'x25519-chacha20-poly1305',
                            },
                        }),
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

            const deliveryServiceProperties = {
                messageTTL: 0,
                sizeLimit: 0,
                notificationChannel: [],
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(
                RpcProxy(
                    axiosMock as Axios,
                    deliveryServiceProperties as any,
                    {} as any,
                    {} as any,
                    {} as any,
                    keysA,
                ),
            );

            const { status, body } = await request(app).post('/').send({
                jsonrpc: '2.0',
                method: 'dm3_getDeliveryServiceProperties',
                params: [],
            });

            expect(mockPost).not.toBeCalled();
            expect(status).toBe(200);
            expect(body).toEqual({
                jsonrpc: '2.0',
                result: JSON.stringify({
                    messageTTL: 0,
                    notificationChannel: [],
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
            app.use(
                RpcProxy(
                    axiosMock as Axios,
                    {} as any,
                    {} as any,
                    {} as any,
                    {} as any,
                    keysA,
                ),
            );

            const { status } = await request(app).post('/');

            expect(mockPost).not.toBeCalled();
            expect(status).toBe(400);

            return;
        });
    });

    describe('resolveProfileExtension', () => {
        it('return 400 if user is unknown', async () => {
            const mockPost = jest.fn((url: string, body: any) => {
                return Promise.reject('Should not have been invoked');
            });
            const axiosMock = {
                post: mockPost,
            } as Partial<Axios>;

            const web3Provider = {
                resolveName: (_: string) => Promise.resolve(RECEIVER_NAME),
            };
            const db = {
                getIdEnsName: async (ensName: string) => ensName,
                getSession: (_: string) => Promise.resolve(null),
                getUsersNotificationChannels: () => Promise.resolve([]),
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(
                RpcProxy(
                    axiosMock as Axios,
                    {} as any,
                    {} as any,
                    web3Provider as any,
                    db as any,
                    keysA,
                ),
            );

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

            const web3Provider = {
                resolveName: (_: string) => Promise.resolve(RECEIVER_NAME),
            };
            const db = {
                getIdEnsName: async (ensName: string) => ensName,
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
                getUsersNotificationChannels: () => Promise.resolve([]),
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(
                RpcProxy(
                    axiosMock as Axios,
                    {} as any,
                    {} as any,
                    web3Provider as any,
                    db as any,
                    keysA,
                ),
            );

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
                result: stringify({
                    notSupportedMessageTypes: ['NEW'],
                }),
            });
        });
    });
});

const getSession = async (ensName: string) => {
    const emptyProfile: UserProfile = {
        publicSigningKey: '',
        publicEncryptionKey: '',
        deliveryServices: [''],
    };

    const isSender = normalizeEnsName(ensName) === SENDER_NAME;
    const isReceiver = normalizeEnsName(ensName) === RECEIVER_NAME;

    const session = (account: string, token: string, profile: UserProfile) => ({
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
        return session(RECEIVER_NAME, 'abc', {
            ...emptyProfile,
            publicEncryptionKey: (await keyPair).publicKey,
        });
    }

    return null;
};
