import express from 'express';
import { v4 } from 'uuid';

export function getExternaApi() {
    const app = express();

    app.post('/rpc', async (req: express.Request, res: express.Response) => {
        const { method, params } = req.body;

        //Create Json Rpc request Id
        const id = v4();

        const supportedHandlers: IRpcCallHandler[] = [];

        const handler = supportedHandlers.find((h) => h.method === method);

        if (!handler) {
            return res.status(400).send({ error: 'Method not supported' });
        }

        const result = await handler.handle(params);

        const baseResponse = {
            id,
            jsonrpc: '2.0',
        };

        if (result.status === 'failed') {
            return res
                .status(200)
                .send({ ...baseResponse, error: result.message });
        }
        return res.status(200).send({ ...baseResponse, result: result.value });
    });
}
