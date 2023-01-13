import bodyParser from 'body-parser';
import express from 'express';
import profile from './profile';
import { auth } from './utils';
import request from 'supertest';

describe('Utils', () => {
    describe('Auth', () => {
        it('Returns 200 if token is valid', async () => {
            const app = express();
            const router = express.Router();
            app.use(bodyParser.json());
            app.use(router);
            router.param('address', auth);

            //Mock request auth protected
            router.get('/:address', (req, res) => {
                return res.send(200);
            });

            app.locals.db = {
                getSession: async (accountAddress: string) =>
                    Promise.resolve({
                        signedUserProfile: {},
                        token: 'foo',
                        createdAt: new Date().getTime(),
                    }),
                setSession: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
            };

            app.locals.web3Provider = {
                resolveName: async () =>
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            };

            app.locals.logger = {
                warn: (_: string) => {},
            };

            const { status, body } = await request(app)
                .get('/alice.eth')
                .set({ authorization: `Bearer foo` })

                .send();

            expect(status).toBe(200);
        });
        it('Returns 401 if user is unknown', async () => {
            const app = express();
            const router = express.Router();
            app.use(bodyParser.json());
            app.use(router);
            router.param('address', auth);

            //Mock request auth protected
            router.get('/:address', (req, res) => {
                return res.send(200);
            });

            app.locals.db = {
                getSession: async (accountAddress: string) =>
                    Promise.resolve(null),
                setSession: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
            };

            app.locals.web3Provider = {
                resolveName: async () =>
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            };

            app.locals.logger = {
                warn: (_: string) => {},
            };

            const { status, body } = await request(app)
                .get('/0x25A643B6e52864d0eD816F1E43c0CF49C83B8292')
                .set({ authorization: `Bearer bar` })

                .send();

            expect(status).toBe(401);
        });
        it('Returns 401 if token is invalid', async () => {
            const app = express();
            const router = express.Router();
            app.use(bodyParser.json());
            app.use(router);
            router.param('address', auth);

            //Mock request auth protected
            router.get('/:address', (req, res) => {
                return res.send(200);
            });

            app.locals.db = {
                getSession: async (accountAddress: string) =>
                    Promise.resolve({
                        signedUserProfile: {},
                        token: 'foo',
                    }),
                setSession: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
            };

            app.locals.web3Provider = {
                resolveName: async () =>
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            };

            app.locals.logger = {
                warn: (_: string) => {},
            };

            const { status, body } = await request(app)
                .get('/0x25A643B6e52864d0eD816F1E43c0CF49C83B8292')
                .set({ authorization: `Bearer bar` })

                .send();

            expect(status).toBe(401);
        });
        it('Returns 401 if token is expired', async () => {
            const app = express();
            const router = express.Router();
            app.use(bodyParser.json());
            app.use(router);
            router.param('address', auth);

            //Mock request auth protected
            router.get('/:address', (req, res) => {
                return res.send(200);
            });

            app.locals.db = {
                getSession: async (accountAddress: string) =>
                    Promise.resolve({
                        signedUserProfile: {},
                        token: 'foo',
                        createdAt: 1,
                    }),
                setSession: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
            };

            app.locals.web3Provider = {
                resolveName: async () =>
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            };

            app.locals.logger = {
                warn: (_: string) => {},
            };

            const { status, body } = await request(app)
                .get('/0x25A643B6e52864d0eD816F1E43c0CF49C83B8292')
                .set({ authorization: `Bearer foo` })

                .send();

            expect(status).toBe(401);
        });
    });
});
