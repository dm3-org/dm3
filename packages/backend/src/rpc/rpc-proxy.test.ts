import { Axios } from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import request from 'supertest';
import RpcProxy from './rpc-proxy';

import nacl from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';

import * as Lib from 'dm3-lib/dist.backend';

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const RECEIVER_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

const { publicKey } = nacl.box.keyPair();
const receiverPublicEncryptionKey = encodeBase64(publicKey);

describe('rpc-Proxy', () => {
    describe('routing', () => {
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
                logger: {
                    warn: (e: any) => {
                        console.log(e);
                    },
                    info: (e: any) => {
                        console.log(e);
                    },
                    error: (e: any) => {
                        console.log(e);
                    },
                },
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
                logger: {
                    warn: (e: any) => {
                        console.log(e);
                    },
                    info: (e: any) => {
                        console.log(e);
                    },
                },
                deliveryServicePrivateKey:
                    '9SZhajjn9tn0fX/eBMXfZfb0RaUeYyfhlNYHqZyKHpyTiYvwVosQ5qt2XxdDFblTzggir8kp85kWw76p2EZ0rQ==',
                deliveryServiceProperties: { sizeLimit: 1024 },
                loadSession,
                redisClient: {
                    zAdd: () => {},
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
                            encryptedData: '',
                            encryptionVersion: 'x25519-xsalsa20-poly1305',
                            from: SENDER_ADDRESS,
                            to: RECEIVER_ADDRESS,
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
                logger: {
                    warn: (e: any) => {
                        console.log(e);
                    },
                    info: (e: any) => {
                        console.log(e);
                    },
                    error: (e: any) => {
                        console.log(e);
                    },
                },
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
});

const loadSession = async (address: string) => {
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
            publicEncryptionKey: receiverPublicEncryptionKey,
        });
    }

    return null;
};
