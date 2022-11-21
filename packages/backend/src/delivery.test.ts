import bodyParser from 'body-parser';
import { ethers } from 'ethers';
import express from 'express';
import request from 'supertest';
import auth from './auth';
import delivery from './delivery';

describe('Delivery', () => {
    describe('getMessages', () => {
        const keysA = {
            encryptionKeyPair: {
                publicKey:
                    '0x78798cab6f457a23ca7cd3e449cb4fb99197bd5d2c29e3bf299917da75ef320c',
                privateKey:
                    '0xa4c23bec5db0dc62bea2664207803ad560ea21238e9d61974767ff3132dba9b6',
            },
            signingKeyPair: {
                publicKey:
                    '0xfad90341665fbfd8b106639bb1ff2d8131d365a8f0004f66b93b450148f67bd2',
                privateKey:
                    '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb895' +
                    'fad90341665fbfd8b106639bb1ff2d8131d365a8f0004f66b93b450148f67bd2',
            },
            storageEncryptionKey:
                '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb895',
            storageEncryptionNonce: 0,
        };

        it('Returns 200 if schema is valid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(delivery());
            (app.locals.keys = {
                signing: keysA.signingKeyPair,
                encryption: keysA.encryptionKeyPair,
            }),
                (app.locals.redisClient = {
                    exists: (_: any) => false,
                });

            app.locals.db = {
                getMessages: () => Promise.resolve([]),
            };

            const token = await createAuthToken();

            app.locals.loadSession = async (accountAddress: string) => ({
                challenge: '123',
                token,
            });

            const { status } = await request(app)
                .get(
                    // eslint-disable-next-line max-len
                    '/messages/0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870/contact/0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870',
                )
                .set({
                    authorization: `Bearer ${token}`,
                })

                .send();

            expect(status).toBe(200);
        });
        it('Returns 400 if schema is invalid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(delivery());

            app.locals.redisClient = {
                exists: (_: any) => false,
            };

            const token = await createAuthToken();

            app.locals.loadSession = async (accountAddress: string) => ({
                challenge: '123',
                token,
            });

            const { status } = await request(app)
                .get(
                    // eslint-disable-next-line max-len
                    '/messages/01234/contact/5679',
                )
                .set({
                    authorization: `Bearer ${token}`,
                })

                .send();

            expect(status).toBe(400);
        });
    });

    describe('getPendingMessages', () => {
        it('Returns 200 if schema is valid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(delivery());

            app.locals.redisClient = {
                exists: (_: any) => false,
                sMembers: (_: any) => [],
                del: (_: any) => {},
            };

            const token = await createAuthToken();

            app.locals.loadSession = async (accountAddress: string) => ({
                challenge: '123',
                token,
            });

            const { status } = await request(app)
                .post(
                    '/messages/0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870/pending',
                )
                .set({
                    authorization: `Bearer ${token}`,
                })

                .send();

            expect(status).toBe(200);
        });
        it('Returns 400 if schema is invalid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(delivery());

            app.locals.redisClient = {
                exists: (_: any) => false,
                sMembers: (_: any) => [],
                del: (_: any) => {},
            };

            const token = await createAuthToken();

            app.locals.loadSession = async (accountAddress: string) => ({
                challenge: '123',
                token,
            });

            const { status } = await request(app)
                .post('/messages/1234/pending')
                .set({
                    authorization: `Bearer ${token}`,
                })

                .send();

            expect(status).toBe(400);
        });
    });

    describe('syncAcknoledgment', () => {
        it('Returns 200 if schema is valid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(delivery());

            app.locals.redisClient = {
                exists: (_: any) => false,
                sMembers: (_: any) => [],
                del: (_: any) => {},
                hSet: (_: any, __: any, ___: any) => {},
                hGetAll: () => ['123', '456'],
                zRemRangeByScore: (_: any, __: any, ___: any) => 0,
            };

            const token = await createAuthToken();

            app.locals.loadSession = async (accountAddress: string) => ({
                challenge: '123',
                token,
            });

            const { status } = await request(app)
                .post(
                    '/messages/0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870/syncAcknoledgment/12345',
                )
                .set({
                    authorization: `Bearer ${token}`,
                })

                .send({
                    acknoledgments: [
                        {
                            contactAddress:
                                '0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870',
                            messageDeliveryServiceTimestamp: 123,
                        },
                    ],
                });

            expect(status).toBe(200);
        });
        it('Returns 400 if params are invalid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(delivery());

            app.locals.redisClient = {
                exists: (_: any) => false,
                sMembers: (_: any) => [],
                del: (_: any) => {},
            };

            const token = await createAuthToken();

            app.locals.loadSession = async (accountAddress: string) => ({
                challenge: '123',
                token,
            });

            const { status } = await request(app)
                .post(
                    '/messages/0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870/syncAcknoledgment/fooo',
                )
                .set({
                    authorization: `Bearer ${token}`,
                })

                .send({
                    acknoledgments: [],
                });

            expect(status).toBe(400);
        });
        it('Returns 400 if body is invalid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(delivery());

            app.locals.redisClient = {
                exists: (_: any) => false,
                sMembers: (_: any) => [],
                del: (_: any) => {},
            };

            const token = await createAuthToken();

            app.locals.loadSession = async (accountAddress: string) => ({
                challenge: '123',
                token,
            });

            const { status } = await request(app)
                .post(
                    '/messages/0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870/syncAcknoledgment/1234',
                )
                .set({
                    authorization: `Bearer ${token}`,
                })

                .send({
                    foo: 'bar',
                });

            expect(status).toBe(400);
        });
    });
});

const createAuthToken = async () => {
    const app = express();
    app.use(bodyParser.json());
    app.use(auth());

    app.locals.redisClient = {
        exists: (_: any) => false,
    };

    app.locals.loadSession = async (accountAddress: string) => ({
        challenge: '123',
    });
    app.locals.storeSession = async (accountAddress: string, session: any) => {
        return (_: any, __: any, ___: any) => {};
    };

    const mnemonic =
        'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

    const wallet = ethers.Wallet.fromMnemonic(mnemonic);

    const signature = await wallet.signMessage('123');

    const { body } = await request(app).post(`/${wallet.address}`).send({
        signature,
    });

    return body.token;
};
