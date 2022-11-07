import bodyParser from 'body-parser';
import { ethers } from 'ethers';
import express from 'express';
import request from 'supertest';
import auth from './auth';
import delivery from './delivery';

describe('Delivery', () => {
    describe.only('getMessages', () => {
        it('Returns 200 if schema is valid', async () => {
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
