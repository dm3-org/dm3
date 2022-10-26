import express from 'express';
import request from 'supertest';
import RpcProxy from './rpc-proxy';

describe('Test the root path', () => {
    const app = express();
    app.use(RpcProxy);

    test('It should response the GET method', async () => {
        const res = request(app).get('/');

        console.log(res);

        expect(true).toBe(false);
    });
});
