import { Axios } from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import request from 'supertest';
import RpcProxy from './rpc-proxy';
import { testData } from '../../../../test-data/encrypted-envelops.test';

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

            global.logger = logger;

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
                deliveryServiceProperties: {
                    messageTTL: 0,
                    sizeLimit: 0,
                    notificationChannel: [],
                },
            };

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
            app.use(RpcProxy(axiosMock as Axios));

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

            const app = express();
            app.use(bodyParser.json());
            app.use(RpcProxy(axiosMock as Axios));

            app.locals = {
                logger,
                web3Provider: {
                    resolveName: (_: string) => Promise.resolve(RECEIVER_NAME),
                },
                db: {
                    getIdEnsName: async (ensName: string) => ensName,
                    getSession: (_: string) => Promise.resolve(null),
                    getUsersNotificationChannels: () => Promise.resolve([]),
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
                    resolveName: (_: string) => Promise.resolve(RECEIVER_NAME),
                },
                db: {
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
