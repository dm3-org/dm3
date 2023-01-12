import * as Lib from 'dm3-lib/dist.backend';
import ethers from 'ethers';
import { Signer } from 'ethers';
import express from 'express';
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
            //TODO should we blackist all request that are not orignated from our dm3 resolver? CC@Heiko
            try {
                const { record, name, signature } =
                    Lib.offchainResolver.decodeCalldata(calldata);

                if (record !== 'dm3.profile') {
                    return res.status(400).send({
                        message: `Record is not supported by this resolver`,
                    });
                }

                //Todo get rid of unused onchain userprofile
                const profile = await req.app.locals.db.getUserProfile(name);

                if (!profile) {
                    return res
                        .status(404)
                        .send({ message: 'Profile not found' });
                }

                const data = await Lib.offchainResolver.encodeUserProfile(
                    signer,
                    profile,
                    resolverAddr,
                    calldata,
                    signature,
                );

                return res.send({ data });
            } catch (e) {
                return res.status(400).send({ message: 'Unknown error' });
            }
        },
    );
    return router;
}
