import * as Lib from 'dm3-lib/dist.backend';
import { Signer } from 'ethers';
import express from 'express';
import { handleCcipRequest } from './handleCcipRequest/handleCcipRequest';
import { WithLocals } from './types';

export function ccipGateway(signer: Signer, resolverAddr: string) {
    const router = express.Router();

    router.get(
        '/:resolverAddr/:calldata',
        async (
            req: express.Request & { app: WithLocals },
            res: express.Response,
        ) => {
            const { resolverAddr } = req.params;
            const calldata = req.params.calldata.replace('.json', '');

            req.app.locals.logger.info(`GET ${resolverAddr}`);

            try {
                const { request, signature } =
                    Lib.offchainResolver.decodeRequest(calldata);

                const response = await handleCcipRequest(
                    req,
                    signature,
                    request,
                );

                if (!response) {
                    Lib.log('Record not found');
                    res.status(404).send({ message: 'Record not found' });
                } else {
                    const data = await Lib.offchainResolver.encodeResponse(
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
