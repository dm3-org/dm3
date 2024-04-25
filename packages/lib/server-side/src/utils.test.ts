import bodyParser from 'body-parser';
import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { auth } from './utils';
import { sign } from 'jsonwebtoken';

const serverSecret = 'testSecret';

describe('Utils', () => {
    describe('Auth', () => {
        it('Returns 200 if token is valid', async () => {
            const token = sign({ user: 'alice.eth' }, serverSecret, {
                expiresIn: '1h',
            });

            const getSession = async (accountAddress: string) =>
                Promise.resolve({
                    signedUserProfile: {},
                    token: 'testToken',
                    createdAt: new Date().getTime(),
                });
            const setSession = async (_: string, __: any) => {
                return (_: any, __: any, ___: any) => {};
            };

            const db = {
                getSession,
                setSession,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            };

            const app = express();
            const router = express.Router();
            app.use(bodyParser.json());
            app.use(router);
            router.param(
                'address',
                async (
                    req: Request,
                    res: Response,
                    next: NextFunction,
                    ensName: string,
                ) => {
                    auth(
                        req,
                        res,
                        next,
                        ensName,
                        db as any,
                        web3Provider as any,
                        serverSecret,
                    );
                },
            );

            //Mock request auth protected
            router.get('/:address', (req, res) => {
                return res.send(200);
            });

            const { status, body } = await request(app)
                .get('/alice.eth')
                .set({ authorization: 'Bearer ' + token })
                .send();

            expect(status).toBe(200);
        });
        it('Returns 401 if user is unknown', async () => {
            const token = sign({ user: 'alice.eth' }, serverSecret, {
                expiresIn: '1h',
            });
            const db = {
                getSession: async (accountAddress: string) =>
                    Promise.resolve(null),
                setSession: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            };

            const app = express();
            const router = express.Router();
            app.use(bodyParser.json());
            app.use(router);
            router.param(
                'address',
                async (
                    req: Request,
                    res: Response,
                    next: NextFunction,
                    ensName: string,
                ) => {
                    auth(
                        req,
                        res,
                        next,
                        ensName,
                        db as any,
                        web3Provider as any,
                        serverSecret,
                    );
                },
            );

            //Mock request auth protected
            router.get('/:address', (req, res) => {
                return res.send(200);
            });

            app.locals.web3Provider = {
                resolveName: async () =>
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            };

            app.locals.logger = {
                warn: (_: string) => {},
            };

            const { status, body } = await request(app)
                .get('/0x25A643B6e52864d0eD816F1E43c0CF49C83B8292')
                .set({ authorization: 'Bearer ' + token })

                .send();

            expect(status).toBe(401);
        });
        it('Returns 401 if token is from wrong user', async () => {
            const token = sign({ user: 'some.other.name' }, serverSecret, {
                expiresIn: '1h',
            });
            const db = {
                getSession: async (accountAddress: string) =>
                    Promise.resolve({
                        signedUserProfile: {},
                        token: 'foo',
                    }),
                setSession: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            };

            const app = express();
            const router = express.Router();
            app.use(bodyParser.json());
            app.use(router);
            router.param(
                'address',
                async (
                    req: Request,
                    res: Response,
                    next: NextFunction,
                    ensName: string,
                ) => {
                    auth(
                        req,
                        res,
                        next,
                        ensName,
                        db as any,
                        web3Provider as any,
                        serverSecret,
                    );
                },
            );

            //Mock request auth protected
            router.get('/:address', (req, res) => {
                return res.send(200);
            });

            const { status, body } = await request(app)
                .get('/0x25A643B6e52864d0eD816F1E43c0CF49C83B8292')
                .set({ authorization: 'Bearer ' + token })

                .send();

            expect(status).toBe(401);
        });
        it('Returns 401 if token is expired', async () => {
            const db = {
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

            const web3Provider = {
                resolveName: async () =>
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            };

            const app = express();
            const router = express.Router();
            app.use(bodyParser.json());
            app.use(router);
            router.param(
                'address',
                async (
                    req: Request,
                    res: Response,
                    next: NextFunction,
                    ensName: string,
                ) => {
                    auth(
                        req,
                        res,
                        next,
                        ensName,
                        db as any,
                        web3Provider as any,
                        serverSecret,
                    );
                },
            );

            //Mock request auth protected
            router.get('/:address', (req, res) => {
                return res.send(200);
            });

            const { status, body } = await request(app)
                .get('/0x25A643B6e52864d0eD816F1E43c0CF49C83B8292')
                .set({ authorization: `Bearer foo` })

                .send();

            expect(status).toBe(401);
        });
    });
});
