import bodyParser from 'body-parser';
import { ethers } from 'ethers';
import express from 'express';
import auth from './auth';
import storage from './storage';
import request from 'supertest';

describe('Storage', () => {
    describe('getUserStorage', () => {
        it('Returns 200 if schema is valid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(storage());

            app.locals.redisClient = {
                get: (_: any) => JSON.stringify({}),
            };

            const token = await createAuthToken();

            app.locals.db = {
                getSession: async (accountAddress: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setSession: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
            };
            const { status } = await request(app)
                .get(`/0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1`)
                .set({
                    authorization: `Bearer ${token}`,
                })

                .send();

            expect(status).toBe(200);
        });
        it('Returns 200 if schema is valid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(storage());

            app.locals.redisClient = {
                get: (_: any) => JSON.stringify({}),
            };

            const token = await createAuthToken();

            app.locals.db = {
                getSession: async (accountAddress: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setSession: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
            };

            const { status } = await request(app)
                .get(`/12345`)
                .set({
                    authorization: `Bearer ${token}`,
                })

                .send();

            expect(status).toBe(400);
        });
    });

    describe('setUserStorage', () => {
        it('Returns 200 if schema is valid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(storage());

            app.locals.redisClient = {
                set: (_: any) => {},
            };

            const token = await createAuthToken();

            app.locals.db = {
                getSession: async (accountAddress: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setSession: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
            };

            const { status } = await request(app)
                .post(`/0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send();

            expect(status).toBe(200);
        });
        it('Returns 400 if schema is invalid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(storage());

            app.locals.redisClient = {
                set: (_: any) => {},
            };

            const token = await createAuthToken();

            app.locals.db = {
                getSession: async (accountAddress: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setSession: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
            };

            const { status } = await request(app)
                .post(`/1234`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send();

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

    app.locals.db = {
        getSession: async (accountAddress: string) =>
            Promise.resolve({
                challenge: '123',
            }),
        setSession: async (_: string, __: any) => {
            return (_: any, __: any, ___: any) => {};
        },
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
