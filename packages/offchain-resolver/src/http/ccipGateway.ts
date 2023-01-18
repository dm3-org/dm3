import * as Lib from 'dm3-lib/dist.backend';
import { Signer } from 'ethers';
import express from 'express';
import { resolveAddr } from './resolver/resolveAddr';
import { resolveText } from './resolver/resolveText';
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
                    Lib.offchainResolver.decodeCalldata(calldata);

                let response;
                if (signature === 'text(bytes32,string)') {
                    response = await resolveText(
                        res,
                        req.app.locals.db,
                        request,
                    );
                }
                if (signature === 'addr(bytes32)') {
                    response = await resolveAddr(
                        res,
                        req.app.locals.db,
                        request,
                    );
                }
                const data = await Lib.offchainResolver.encodeResponse(
                    signer,
                    resolverAddr,
                    response,
                    calldata,
                    'text(bytes32,string)',
                );

                return res.send({ data });
            } catch (e) {
                return res.status(400).send({ message: 'Unknown error' });
            }
        },
    );
    return router;
}
