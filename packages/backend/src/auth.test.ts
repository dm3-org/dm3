import bodyParser from 'body-parser';
import express from 'express';
import request from 'supertest';
import auth from './auth';

describe('Auth', () => {
    describe.only('getChallenge', () => {
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

                app.locals.loadSession = async (accountAddress: string) => ({
                    challenge: '123',
                });
                app.locals.storeSession = async (
                    accountAddress: string,
                    session: any,
                ) => {
                    return (_: any, __: any, ___: any) => {};
                };

                const { status } = await request(app)
                    .get('/0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870')
                    .send();

                expect(status).toBe(200);
            });
        });
    });
});
