import express from 'express';
import * as Lib from 'dm3-lib/dist.backend';
import { id } from 'ethers/lib/utils';
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

export function ccipGateway() {
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
        '/:name',
        async (
            req: express.Request & { app: WithLocals },
            res: express.Response,
        ) => {
            const { name } = req.params;
            const profile = await req.app.locals.db.getUserProfile(name);

            if (!profile) {
                return res.send(404);
            }

            return res.send(profile);
        },
    );
    return router;
}
