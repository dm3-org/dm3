import bodyParser from 'body-parser';
import express from 'express';
import profile from './profile';
import { auth } from './utils';
import request from 'supertest';

describe('Utils', () => {
    describe('Auth', () => {
        it.only('Returns 200 if token is valid', async () => {
            const app = express();
            const router = express.Router();
            app.use(bodyParser.json());
            app.use(router);
            router.param('address', auth);

            //Mock request auth protected
            router.get('/:address', (req, res) => {
                return res.send(200);
            });

            app.locals.loadSession = (_: string) =>
                Promise.resolve({
                    signedUserProfile: {},
                    token: 'foo',
                });

            app.locals.logger = {
                warn: (_: string) => {},
            };

            const { status, body } = await request(app)
                .get('/0x25A643B6e52864d0eD816F1E43c0CF49C83B8292')
                .set({ authorization: `Bearer foo` })

                .send();

            expect(status).toBe(200);
        });
        it.only('Returns 401 if user is unknown', async () => {
            const app = express();
            const router = express.Router();
            app.use(bodyParser.json());
            app.use(router);
            router.param('address', auth);

            //Mock request auth protected
            router.get('/:address', (req, res) => {
                return res.send(200);
            });

            app.locals.loadSession = (_: string) => Promise.resolve(null);

            app.locals.logger = {
                warn: (_: string) => {},
            };

            const { status, body } = await request(app)
                .get('/0x25A643B6e52864d0eD816F1E43c0CF49C83B8292')
                .set({ authorization: `Bearer bar` })

                .send();

            expect(status).toBe(401);
        });
        it.only('Returns 401 if token is invalid', async () => {
            const app = express();
            const router = express.Router();
            app.use(bodyParser.json());
            app.use(router);
            router.param('address', auth);

            //Mock request auth protected
            router.get('/:address', (req, res) => {
                return res.send(200);
            });

            app.locals.loadSession = (_: string) =>
                Promise.resolve({
                    signedUserProfile: {},
                    token: 'foo',
                });

            app.locals.logger = {
                warn: (_: string) => {},
            };

            const { status, body } = await request(app)
                .get('/0x25A643B6e52864d0eD816F1E43c0CF49C83B8292')
                .set({ authorization: `Bearer bar` })

                .send();

            expect(status).toBe(401);
        });
    });
});
