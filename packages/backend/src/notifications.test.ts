import bodyParser from 'body-parser';
import express from 'express';
import auth from './auth';
import storage from './storage';
import request from 'supertest';
import notifications from './notifications';
import exp from 'constants';
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

describe('Notifications', () => {
    describe('get NotificationChannels', () => {
        it('Returns 200 and an empty array when the user has no chanels set up', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(notifications());

            const token = await createAuthToken();

            app.locals.db = {
                getSession: async (ensName: string) =>
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
                getUserStorage: async (addr: string) => {
                    return {};
                },
                getIdEnsName: async (ensName: string) => ensName,
                getUsersNotificationChannels: async (ensName: string) =>
                    Promise.resolve([]),
            };

            app.locals.web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            const { status, body } = await request(app)
                .get(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })

                .send();

            expect(status).toBe(200);
            expect(body).toEqual([]);
        });
    });

    describe('setUserStorage', () => {
        it('User can setup email notifications', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(notifications());

            const token = await createAuthToken();

            const addUsersNotificationChannelMock = jest.fn();

            app.locals.db = {
                getSession: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setSession: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                addUsersNotificationChannel: addUsersNotificationChannelMock,
            };
            app.locals.web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            const { status } = await request(app)
                .post(`/email/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    recipientAddress: 'bob.eth',
                });

            expect(status).toBe(200);
            expect(addUsersNotificationChannelMock).toHaveBeenCalledWith(
                'bob.eth',
                {
                    type: 'EMAIL',
                    config: {
                        recipientAddress: 'bob.eth',
                    },
                },
            );
        });
    });
});

const createAuthToken = async () => {
    const app = express();
    app.use(bodyParser.json());
    app.use(auth());

    app.locals = {
        web3Provider: {
            resolveName: async () =>
                '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
        },
        redisClient: {
            exists: (_: any) => false,
        },
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
        getIdEnsName: async (ensName: string) => ensName,
    };

    const signature =
        '3A893rTBPEa3g9FL2vgDreY3vvXnOiYCOoJURNyctncwH' +
        '0En/mcwo/t2v2jtQx/pcnOpTzuJwLuZviTQjd9vBQ==';

    const { body } = await request(app).post(`/bob.eth`).send({
        signature,
    });

    return body.token;
};
