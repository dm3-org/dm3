import {
    decodeRequest,
    encodeResponse,
} from 'dm3-lib-offchain-resolver/dist.backend';
import { logError } from 'dm3-lib-shared/dist.backend';
import { Signer } from 'ethers';
import express from 'express';
import { handleCcipRequest } from './handleCcipRequest/handleCcipRequest';
import { WithLocals } from './types';

export function ccipGateway(signer: Signer, resolverAddr: string) {
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
                    const data = await encodeResponse(
                        signer,
                        resolverAddr,
                        response,
                        calldata,
                        signature,
                    );

                    res.send({ data });
                }
            } catch (e) {
                req.app.locals.logger.warn((e as Error).message);
                res.status(400).send({ message: 'Unknown error' });
            }
        },
    );
    return router;
}
