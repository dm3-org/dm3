import bodyParser from 'body-parser';
import express from 'express';
import profile from './profile';
import request from 'supertest';

describe('Profile', () => {
    describe('getProfile', () => {
        it('Returns 200 if schema is valid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(profile());

            app.locals.loadSession = (_: string) =>
                Promise.resolve({
                    signedUserProfile: {},
                });

            const { status } = await request(app)
                .get('/0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870')
                .send();

            expect(status).toBe(200);
        });
        it('Returns 400 if schema is invalid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(profile());

            app.locals.loadSession = (_: string) =>
                Promise.resolve({
                    signedUserProfile: {},
                });

            const { status, body } = await request(app).get('/12345').send();

            expect(status).toBe(400);
        });
    });
});
