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
            const { resolverAddr, calldata } = req.params;
            try {
                const { request, signature } =
                    Lib.offchainResolver.decodeRequest(calldata);

                const response = await handleCcipRequest(
                    req,
                    res,
                    signature,
                    request,
                );

                const data = await Lib.offchainResolver.encodeResponse(
                    signer,
                    resolverAddr,
                    response,
                    calldata,
                    'text(bytes32,string)',
                );
                Lib.log(`GET ${resolverAddr} ${calldata}`);

                return res.send({ data });
            } catch (e) {
                return res.status(400).send({ message: 'Unknown error' });
            }
        },
    );
    return router;
}
