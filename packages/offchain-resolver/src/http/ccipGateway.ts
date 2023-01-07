import * as Lib from 'dm3-lib/dist.backend';
import { Signer } from 'ethers';
import express from 'express';
import { WithLocals } from './types';
const addProfileSchema = {
    type: 'object',
    properties: {
        address: { type: 'string' },
        name: { type: 'string' },
        signedUserProfile: {
            ...Lib.account.schema.SignedUserProfile.definitions
                .SignedUserProfile,
            properties: {
                ...Lib.account.schema.SignedUserProfile.definitions
                    .SignedUserProfile.properties,
                profile: {
                    ...Lib.account.schema.SignedUserProfile.definitions
                        .UserProfile,
                },
            },
        },
    },
    required: ['address', 'name', 'signedUserProfile'],
    additionalProperties: false,
};

export function ccipGateway(signer: Signer, resolverAddr: string) {
    const router = express.Router();

    router.post(
        '/',
        async (req: express.Request & { app: WithLocals }, res, next) => {
            const isSchemaValid = Lib.validateSchema(
                addProfileSchema,
                req.body,
            );

            //Check if schema is valid
            if (!isSchemaValid) {
                return res.status(400).send({ error: 'invalid schema' });
            }

            const { signedUserProfile, name, address } = req.body;

            const profileIsValid = Lib.account.checkUserProfile(
                signedUserProfile,
                address,
            );

            //Check if profile sig is correcet
            if (!profileIsValid) {
                return res.status(400).send({ error: 'invalid profile' });
            }

            const profileExists = await req.app.locals.db.getUserProfile(name);

            if (profileExists) {
                return res
                    .status(400)
                    .send({ error: 'subdomain already claimed' });
            }
            //TODO impl sig
            await req.app.locals.db.setUserProfile(name, {
                profile: signedUserProfile.profile,
                signatures: [],
            });

            return res.send(200);
        },
    );

    router.get(
        '/:resolverAddr/:data',
        async (
            req: express.Request & { app: WithLocals },
            res: express.Response,
        ) => {
            const { resolverAddr, data } = req.params;
            //TODO should we blackist all request that are not orignated from our dm3 resolver? CC@Heiko
            try {
                const { record, name, signature } =
                    Lib.offchainResolver.decodeCalldata(data);

                if (record !== 'eth.dm3.profile') {
                    return res.status(400).send({
                        error: `Record is not supported by this resolver`,
                    });
                }

                //Todo get rid of unused onchain userprofile
                const profile = await req.app.locals.db.getUserProfile(name);

                if (!profile) {
                    return res.send(404);
                }

                const { userProfile, validUntil, sigData } =
                    await Lib.offchainResolver.encodeUserProfile(
                        signer,
                        profile.profile,
                        resolverAddr,
                        data,
                        signature,
                    );

                return res.send({ userProfile, validUntil, sigData });
            } catch (e) {
                return res.status(400).send({ error: 'Unknown error' });
            }
        },
    );
    return router;
}
