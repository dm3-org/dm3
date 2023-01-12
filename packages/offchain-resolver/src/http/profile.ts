import express from 'express';
import ethers from 'ethers';
import { WithLocals } from './types';
import * as Lib from 'dm3-lib/dist.backend';

export function profile(web3Provider: ethers.providers.BaseProvider) {
    const router = express.Router();

    router.post(
        '/',
        async (req: express.Request & { app: WithLocals }, res, next) => {
            const { signedUserProfile, name, address } = req.body;
            const isSchemaValid = Lib.validateSchema(
                Lib.account.schema.SignedUserProfile,
                signedUserProfile,
            );

            //Check if schema is valid
            if (!isSchemaValid) {
                return res.status(400).send({ error: 'invalid schema' });
            }

            const profileIsValid = Lib.account.checkUserProfile(
                signedUserProfile,
                address,
            );

            //Check if profile sig is correcet
            if (!profileIsValid) {
                return res.status(400).send({ error: 'invalid profile' });
            }

            //Lib.account.ethBalanceFilter();
            const profileExists = await req.app.locals.db.getUserProfile(name);

            if (profileExists) {
                return res
                    .status(400)
                    .send({ error: 'subdomain already claimed' });
            }
            await req.app.locals.db.setUserProfile(
                name,
                signedUserProfile.profile,
            );

            return res.send(200);
        },
    );
    return router;
}
