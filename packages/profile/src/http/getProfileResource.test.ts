import bodyParser from 'body-parser';
import express from 'express';
import { getProfileResource } from './getProfileResource';
import request from 'supertest';

describe('getProfileResource', () => {
    it('Test', async () => {
        const app = express();
        app.use(bodyParser.json());
        app.use(getProfileResource());

        const { status } = await request(app).get(`/`).send();

        expect(status).toBe(200);
    });
});
