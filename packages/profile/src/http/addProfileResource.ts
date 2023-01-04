import express from 'express';
import * as Lib from 'dm3-lib/dist.backend';

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

export function addProfileResource() {
    const router = express.Router();

    router.post('/', async (req: express.Request, res, next) => {
        // eslint-disable-next-line no-console
        console.log(addProfileSchema);
        const isSchemaValid = Lib.validateSchema(addProfileSchema, req.body);

        if (!isSchemaValid) {
            return res.status(400).send({ error: 'invalid schema' });
        }

        const { signedUserProfile, name, address } = req.body;

        return res.send(200);

        //Check if schema is valid
        //Check if profile sig is correcet
        //Check if name is still available
    });
    return router;
}
