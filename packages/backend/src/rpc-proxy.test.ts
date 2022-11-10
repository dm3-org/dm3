import { Axios } from 'axios';
import bodyParser, { json } from 'body-parser';
import express from 'express';
import request from 'supertest';
import RpcProxy from './rpc-proxy';

//Fix test if params are finally specified
describe.skip('rpc-Proxy', () => {
    describe('routing', () => {
        test('Should route non-dm3 related messages to the rpc node', async () => {
            const mockPost = jest.fn((url: string, body: any) => {
                return Promise.resolve({ data: 'Forwarded' });
            });
            const axiosMock = {
                post: mockPost,
            } as Partial<Axios>;

            const app = express();
            app.use(bodyParser.json());
            app.use(RpcProxy(axiosMock as Axios));

            const { body } = await request(app)
                .post('/')
                .send({
                    jsonrpc: '2.0',
                    method: 'eth_getBlockByHash',
                    params: [
                        '0xdc0818cf78f21a8e70579cb46a43643f78291264dda342ae31049421c82d21ae',
                        false,
                    ],
                    id: 1,
                });

            expect(body).toBe('Forwarded');
            expect(mockPost).toBeCalled();

            return;
        });
        test('Should handle dm3_submitMessage', async () => {
            const mockPost = jest.fn((url: string, body: any) => {
                return Promise.reject('Should not have been invoked');
            });
            const axiosMock = {
                post: mockPost,
            } as Partial<Axios>;

            const app = express();
            app.use(bodyParser.json());
            app.use(RpcProxy(axiosMock as Axios));

            const { status } = await request(app)
                .post('/')
                .send({
                    jsonrpc: '2.0',
                    method: 'dm3_submitMessage',
                    params: [
                        JSON.stringify({
                            envelop: {
                                encryptedData: '',
                                encryptionVersion: 'x25519-xsalsa20-poly1305',
                                from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                                to: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                            },
                        }),
                        '123',
                    ],
                    id: 1,
                });

            expect(mockPost).not.toBeCalled();
            expect(status).toBe(200);

            return;
        });

        test('Should return 400 if method is undefined', async () => {
            const mockPost = jest.fn((url: string, body: any) => {
                return Promise.reject('Should not have been invoked');
            });
            const axiosMock = {
                post: mockPost,
            } as Partial<Axios>;

            const app = express();
            app.use(bodyParser.json());
            app.use(RpcProxy(axiosMock as Axios));

            const { status } = await request(app).post('/');

            expect(mockPost).not.toBeCalled();
            expect(status).toBe(400);

            return;
        });
    });
});
