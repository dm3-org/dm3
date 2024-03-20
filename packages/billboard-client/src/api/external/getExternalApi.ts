import express from 'express';
import { v4 } from 'uuid';
import cors from 'cors';
import { getViewerCountHandler } from './handler/getViewerCount';
import { getMessagesHandler } from './handler/getMessages';
import { IDatabase } from '../../persitance/getDatabase';
import { IViewerService } from '../../service/viewerService/IViewerService';
import { logDebug, logInfo } from '@dm3-org/dm3-lib-shared';

export function getExternalApi(db: IDatabase, viewerService: IViewerService) {
    const app = express();
    app.use(cors());

    app.post('/rpc', async (req: express.Request, res: express.Response) => {
        const { method, params } = req.body;

        logInfo({ msg: '/rpc', method });
        logDebug({ msg: '/rpc', method, params });

        //Create Json Rpc request Id
        const id = v4();

        //Register all handlers the api is supporting
        const supportedHandlers: IRpcCallHandler[] = [
            getViewerCountHandler(viewerService),
            getMessagesHandler(db),
        ];

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

    return app;
}
