import bodyParser from 'body-parser';
import express from 'express';
import request from 'supertest';
import { Auth } from './auth';
import { ethers } from 'ethers';
import winston from 'winston';

// global.logger = winston.createLogger({
//     transports: [new winston.transports.Console()],
// });

describe('Auth', () => {
    const getSessionMock = async (ensName: string) =>
        Promise.resolve({ challenge: '123' });
    const setSessionMock = async (_: string, __: any) => {
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
            it('Returns 200 if schema is valid', async () => {
                const app = express();
                app.use(bodyParser.json());
                app.use(Auth(getSessionMock, setSessionMock));

                const response = await request(app)
                    .get(
                        '/0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870.dev-addr.dm3.eth',
                    )
                    .send();

                expect(response.status).toBe(200);
                expect(response.body).toEqual({ challenge: '123' });
            });
        });
    });

    describe('createNewSessionToken', () => {
        describe('schema', () => {
            it('Returns 400 if params is invalid', async () => {
                const app = express();
                app.use(bodyParser.json());
                app.use(Auth(getSessionMock, setSessionMock));

                const mnemonic =
                    'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

                const wallet = ethers.Wallet.fromMnemonic(mnemonic);

                const signature = await wallet.signMessage('123');

                const { status } = await request(app).post(`/1234`).send({
                    signature: 123,
                });

                expect(status).toBe(400);
            });
            it('Returns 400 if body is invalid', async () => {
                const app = express();
                app.use(bodyParser.json());
                app.use(Auth(getSessionMock, setSessionMock));

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
                const getSessionMockLocal = async (ensName: string) => ({
                    challenge: 'my-Challenge',
                    signedUserProfile: {
                        profile: {
                            publicSigningKey: keysA.signingKeyPair.publicKey,
                        },
                    },
                });

                const app = express();
                app.use(bodyParser.json());
                app.use(Auth(getSessionMockLocal, setSessionMock));

                const signature =
                    '3A893rTBPEa3g9FL2vgDreY3vvXnOiYCOoJURNyctncwH' +
                    '0En/mcwo/t2v2jtQx/pcnOpTzuJwLuZviTQjd9vBQ==';

                const { status } = await request(app)
                    .post(`/0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1`)
                    .send({
                        signature,
                    });

                expect(status).toBe(200);
            });
        });
    });
});
