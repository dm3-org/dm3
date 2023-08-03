import { logError } from 'dm3-lib-shared/dist.backend';
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

            req.app.locals.logger.info(`GET ${resolverAddr}`);

            try {
                const { request, signature } = decodeRequest(calldata);

                const response = await handleCcipRequest(
                    req,
                    signature,
                    request,
                );

                if (!response) {
                    logError('Record not found');

                    res.status(404).send({ message: 'Record not found' });
                } else {
                    res.send(response);
                }
            } catch (e) {
                req.app.locals.logger.warn((e as Error).message);

                res.status(400).send({ message: 'Unknown error' });
            }
        },
    );
    return router;
}
