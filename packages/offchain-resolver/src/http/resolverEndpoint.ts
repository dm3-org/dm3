import { logError, logWarning } from '@dm3-org/dm3-lib-shared';
import express from 'express';
import { handleCcipRequest } from './handleCcipRequest/handleCcipRequest';
import { WithLocals } from './types';
import { decodeRequest } from './handleCcipRequest/encoding/decodeRequest';

export function resolverEndpoint() {
    const router = express.Router();

    router.get(
        '/:resolverAddr/:calldata',
        //@ts-ignore
        async (
            req: express.Request & { app: WithLocals },
            res: express.Response,
        ) => {
            const { resolverAddr } = req.params;

            const calldata = req.params.calldata.replace('.json', '');

            global.logger.info(`GET ${resolverAddr}`);

            try {
                const { request, signature } = decodeRequest(calldata);

                const response = await handleCcipRequest(
                    req,
                    signature,
                    request,
                );

                if (!response) {
                    logWarning('Record not found');
                    res.status(200).send('0x');
                } else {
                    res.status(200).send(response);
                }
            } catch (e) {
                global.logger.warn((e as Error).message);

                res.status(400).send({ message: 'Unknown error' });
            }
        },
    );
    return router;
}
