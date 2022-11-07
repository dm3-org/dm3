import bodyParser from 'body-parser';
import express from 'express';
import request from 'supertest';
import auth from './auth';
import { ethers } from 'ethers';
describe('Auth', () => {
    let sender;

    beforeEach(async () => {});
    describe('getChallenge', () => {
        describe('schema', () => {
            it('Returns 400 if schema is invalid', async () => {
                const app = express();
                app.use(bodyParser.json());
                app.use(auth());

                app.locals.loadSession = async (accountAddress: string) => ({
                    challenge: '123',
                });
                app.locals.storeSession = async (
                    accountAddress: string,
                    session: any,
                ) => {
                    return (_: any, __: any, ___: any) => {};
                };

                const { status } = await request(app).get('/890').send();

                expect(status).toBe(400);
            });
            it('Returns 200 if schema is valid', async () => {
                const app = express();
                app.use(bodyParser.json());
                app.use(auth());

                app.locals.loadSession = async (_: string) => ({
                    challenge: '123',
                });
                app.locals.storeSession = async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                };

                const { status } = await request(app)
                    .get('/0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870')
                    .send();

                expect(status).toBe(200);
            });
        });
    });

    describe('createNewSessionToken', () => {
        describe('schema', () => {
            it('Returns 400 if params is invalid', async () => {
                const app = express();
                app.use(bodyParser.json());
                app.use(auth());

                app.locals.loadSession = async (_: string) => ({
                    challenge: '123',
                });
                app.locals.storeSession = async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                };
                const mnemonic =
                    'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

                const wallet = ethers.Wallet.fromMnemonic(mnemonic);

                const signature = await wallet.signMessage('123');

                const { status } = await request(app).post(`/1234`).send({
                    signature,
                });

                expect(status).toBe(400);
            });
            it('Returns 400 if body is invalid', async () => {
                const app = express();
                app.use(bodyParser.json());
                app.use(auth());

                app.locals.loadSession = async (_: string) => ({
                    challenge: '123',
                });
                app.locals.storeSession = async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                };
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
                const app = express();
                app.use(bodyParser.json());
                app.use(auth());

                app.locals.loadSession = async (_: string) => ({
                    challenge: '123',
                });
                app.locals.storeSession = async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                };
                const mnemonic =
                    'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

                const wallet = ethers.Wallet.fromMnemonic(mnemonic);

                const signature = await wallet.signMessage('123');

                const { status } = await request(app)
                    .post(`/${wallet.address}`)
                    .send({
                        signature,
                    });

                expect(status).toBe(200);
            });
        });
    });
});
