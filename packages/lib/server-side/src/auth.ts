import { validateSchema } from '@dm3-org/dm3-lib-shared';
import {
    createChallenge,
    createNewSessionToken,
} from '@dm3-org/dm3-lib-delivery';
import express from 'express';
import cors from 'cors';
//import { WithLocals } from './types';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';

const getChallengeSchema = {
    type: 'object',
    properties: {
        ensName: { type: 'string' },
    },
    required: ['ensName'],
    additionalProperties: false,
};

const createNewSessionTokenParamsSchema = {
    type: 'object',
    properties: {
        ensName: { type: 'string' },
    },
    required: ['ensName'],
    additionalProperties: false,
};

const createNewSessionTokenBodySchema = {
    type: 'object',
    properties: {
        signature: { type: 'string' },
    },
    required: ['signature'],
    additionalProperties: false,
};

//@ts-ignore
export const Auth = (getSession, setSession) => {
    const router = express.Router();

    //TODO remove
    router.use(cors());

    router.get('/:ensName', async (req: express.Request, res, next) => {
        try {
            const idEnsName = normalizeEnsName(req.params.ensName);

            const schemaIsValid = validateSchema(
                getChallengeSchema,
                req.params,
            );

            if (!schemaIsValid) {
                return res.send(400);
            }

            const challenge = await createChallenge(
                getSession,
                setSession,
                idEnsName,
            );

            res.json({
                challenge,
            });
        } catch (e) {
            next(e);
        }
    });

    router.post(
        '/:ensName',
        //@ts-ignore
        async (req: express.Request, res, next) => {
            try {
                const idEnsName = await normalizeEnsName(req.params.ensName);
                const paramsAreValid = validateSchema(
                    createNewSessionTokenParamsSchema,
                    req.params,
                );

                const bodyIsValid = validateSchema(
                    createNewSessionTokenBodySchema,
                    req.body,
                );

                const schemaIsValid = paramsAreValid && bodyIsValid;

                if (!schemaIsValid) {
                    return res.send(400);
                }

                const token = await createNewSessionToken(
                    getSession,
                    setSession,
                    req.body.signature,
                    idEnsName,
                );

                res.json({
                    token,
                });
            } catch (e) {
                next(e);
            }
        },
    );

    return router;
};
