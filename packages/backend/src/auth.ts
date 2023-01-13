import * as Lib from 'dm3-lib/dist.backend';
import express from 'express';
import cors from 'cors';
import { WithLocals } from './types';

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

export default () => {
    const router = express.Router();

    //TODO remove
    router.use(cors());

    router.get(
        '/:ensName',
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const ensName = Lib.account.normalizeEnsName(
                    req.params.ensName,
                );
                const schemaIsValid = Lib.validateSchema(
                    getChallengeSchema,
                    req.params,
                );

                if (!schemaIsValid) {
                    return res.send(400);
                }

                const challenge = await Lib.delivery.createChallenge(
                    req.app.locals.db.getSession,
                    req.app.locals.db.setSession,
                    ensName,
                );

                res.json({
                    challenge,
                });
            } catch (e) {
                next(e);
            }
        },
    );

    router.post(
        '/:ensName',
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const ensName = Lib.account.normalizeEnsName(
                    req.params.ensName,
                );
                const paramsAreValid = Lib.validateSchema(
                    createNewSessionTokenParamsSchema,
                    req.params,
                );

                const bodyIsValid = Lib.validateSchema(
                    createNewSessionTokenBodySchema,
                    req.body,
                );

                const schemaIsValid = paramsAreValid && bodyIsValid;

                if (!schemaIsValid) {
                    return res.send(400);
                }

                const token = await Lib.delivery.createNewSessionToken(
                    req.app.locals.db.getSession,
                    req.app.locals.db.setSession,
                    req.body.signature,
                    ensName,
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
