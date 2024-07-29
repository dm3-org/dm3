import { sign } from '@dm3-org/dm3-lib-crypto';
import {
    Session,
    createChallenge,
    spamFilter,
} from '@dm3-org/dm3-lib-delivery';
import { SignedUserProfile } from '@dm3-org/dm3-lib-profile';
import bodyParser from 'body-parser';
import { ethers } from 'ethers';
import express from 'express';
import { verify } from 'jsonwebtoken';
import request from 'supertest';
import { Auth } from './auth';
import { IAccountDatabase } from './iSessionDatabase';

const serverSecret = 'testSecret';

describe('Auth', () => {
    const getAccountMock = async (ensName: string) =>
        Promise.resolve({ challenge: '123' });
    const setAccountMock = async (_: string, __: any) => {
        return (_: any, __: any, ___: any) => {};
    };

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

    describe('getChallenge', () => {
        describe('schema', () => {
            it('Returns 200 and a jwt if schema is valid', async () => {
                const db = {
                    getAccount: getAccountMock,
                } as IAccountDatabase;

                const app = express();
                app.use(bodyParser.json());
                app.use(Auth(db, serverSecret));

                const response = await request(app)
                    .get(
                        '/0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870.dev-addr.dm3.eth',
                    )
                    .send();
                console.log(response);

                expect(response.status).toBe(200);

                // verify that the response is a jwt with the expected content
                const challengeJwt = response.body;
                const jwtPayload = verify(challengeJwt, serverSecret, {
                    algorithms: ['HS256'],
                });

                if (typeof jwtPayload == 'string') {
                    throw new Error('jwt contains wrong payload');
                }

                if (
                    !('account' in jwtPayload) ||
                    !jwtPayload.account ||
                    jwtPayload.account !=
                        '0x99c19ab10b9ec8ac6fcda9586e81f6b73a298870.dev-addr.dm3.eth'
                ) {
                    console.log(jwtPayload.account);
                    throw new Error('account missing or bad');
                }
                if (
                    !('challenge' in jwtPayload) ||
                    !jwtPayload.challenge ||
                    typeof jwtPayload.challenge !== 'string'
                ) {
                    console.log(jwtPayload.challenge);
                    throw new Error('challenge missing or bad');
                }
                if (
                    !('iat' in jwtPayload) ||
                    !jwtPayload.iat ||
                    jwtPayload.iat > Date.now() / 1000
                ) {
                    throw new Error('iat missing or bad');
                }
                if (
                    !('exp' in jwtPayload) ||
                    !jwtPayload.exp ||
                    jwtPayload.exp <= Date.now() / 1000
                ) {
                    throw new Error('exp missing or bad');
                }
                if (
                    !(
                        'nbf' in jwtPayload ||
                        !jwtPayload.nbf ||
                        jwtPayload.nbf > Date.now() / 1000
                    )
                ) {
                    throw new Error('nbf missing or bad');
                }
            });
        });
    });

    describe('createNewSessionToken', () => {
        describe('schema', () => {
            it('Returns 400 if params is invalid', async () => {
                const app = express();
                const db = {
                    getAccount: getAccountMock,
                } as IAccountDatabase;

                app.use(bodyParser.json());
                app.use(Auth(db, serverSecret));

                const mnemonic =
                    'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

                const wallet = ethers.Wallet.fromMnemonic(mnemonic);

                const sessionMocked = {
                    challenge: '123',
                    token: 'deprecated token that is not used anymore',
                    signedUserProfile: {},
                } as Session & {
                    spamFilterRules: spamFilter.SpamFilterRules;
                };

                // create the challenge jwt
                const challengeJwt = createChallenge(
                    async (ensName: string) =>
                        Promise.resolve<
                            Session & {
                                spamFilterRules: spamFilter.SpamFilterRules;
                            }
                        >(sessionMocked),
                    '1234',
                    serverSecret,
                );

                const signature = await wallet.signMessage('123');

                const { status } = await request(app).post(`/1234`).send({
                    signature: 123,
                    challenge: challengeJwt,
                });

                expect(status).toBe(400);
            });
            it('Returns 400 if body is invalid', async () => {
                const app = express();
                const db = {
                    getAccount: getAccountMock,
                } as IAccountDatabase;

                app.use(bodyParser.json());
                app.use(Auth(db, serverSecret));

                const mnemonic =
                    'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

                const wallet = ethers.Wallet.fromMnemonic(mnemonic);

                const foo = await wallet.signMessage('123');

                const { status } = await request(app)
                    .post(`/${wallet.address}`)
                    .send({
                        foo,
                    });

                expect(status).toBe(400);
            });
            it('Returns 200 if schema is valid', async () => {
                const sessionMocked = {
                    challenge: 'deprecated challenge that is not used anymore',
                    token: 'deprecated token that is not used anymore',
                    signedUserProfile: {
                        profile: {
                            publicSigningKey: keysA.signingKeyPair.publicKey,
                        },
                    } as SignedUserProfile,
                } as Session & {
                    spamFilterRules: spamFilter.SpamFilterRules;
                };

                const getAccountMockLocal = async (ensName: string) =>
                    Promise.resolve<
                        Session & {
                            spamFilterRules: spamFilter.SpamFilterRules;
                        }
                    >(sessionMocked);
                // async (ensName: string) => ({
                //     challenge: 'my-Challenge',
                //     signedUserProfile: {
                //         profile: {
                //             publicSigningKey: keysA.signingKeyPair.publicKey,
                //         },
                //     },
                // });

                const app = express();
                const db = {
                    getAccount: getAccountMockLocal,
                } as IAccountDatabase;

                app.use(bodyParser.json());
                app.use(Auth(db, serverSecret));

                // create the challenge jwt
                const challengeJwt = await createChallenge(
                    getAccountMockLocal,
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
                    serverSecret,
                );

                const signature = await sign(
                    keysA.signingKeyPair.privateKey,
                    challengeJwt,
                );

                const { status } = await request(app)
                    .post(`/0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1`)
                    .send({
                        signature: signature,
                        challenge: challengeJwt as string,
                    });

                expect(status).toBe(200);
            });
        });
    });
});
