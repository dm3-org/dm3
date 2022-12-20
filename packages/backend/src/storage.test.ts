import bodyParser from 'body-parser';
import express from 'express';
import auth from './auth';
import storage from './storage';
import request from 'supertest';

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
                        signedUserProfile: {
                            profile: {
                                publicSigningKey:
                                    keysA.signingKeyPair.publicKey,
                            },
                        },
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
                challenge: 'my-Challenge',
                signedUserProfile: {
                    profile: {
                        publicSigningKey: keysA.signingKeyPair.publicKey,
                    },
                },
            }),
        setSession: async (_: string, __: any) => {
            return (_: any, __: any, ___: any) => {};
        },
    };

    const signature =
        '3A893rTBPEa3g9FL2vgDreY3vvXnOiYCOoJURNyctncwH' +
        '0En/mcwo/t2v2jtQx/pcnOpTzuJwLuZviTQjd9vBQ==';

    const { body } = await request(app)
        .post(`/0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1`)
        .send({
            signature,
        });

    return body.token;
};
