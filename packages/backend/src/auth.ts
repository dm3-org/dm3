import * as Lib from 'dm3-lib/dist.backend';
import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import { WithLocals } from './types';

const getChallengeSchema = {
    type: 'object',
    properties: {
        address: { type: 'string' },
    },
    required: ['address'],
    additionalProperties: false,
};

const createNewSessionTokenParamsSchema = {
    type: 'object',
    properties: {
        address: { type: 'string' },
    },
    required: ['address'],
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
        '/:address',
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const schemaIsValid = Lib.validateSchema(
                    getChallengeSchema,
                    req.params,
                );

                if (
                    !schemaIsValid ||
                    !ethers.utils.isAddress(req.params.address)
                ) {
                    return res.send(400);
                }

                const account = Lib.external.formatAddress(req.params.address);

                const challenge = await Lib.delivery.createChallenge(
                    req.app.locals.db.getSession,
                    req.app.locals.db.setSession,
                    account,
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
        '/:address',
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const paramsAreValid = Lib.validateSchema(
                    createNewSessionTokenParamsSchema,
                    req.params,
                );

                const bodyIsValid = Lib.validateSchema(
                    createNewSessionTokenBodySchema,
                    req.body,
                );

                const schemaIsValid = paramsAreValid && bodyIsValid;

                if (
                    !schemaIsValid ||
                    !ethers.utils.isAddress(req.params.address)
                ) {
                    return res.send(400);
                }

                const account = Lib.external.formatAddress(req.params.address);

                const token = await Lib.delivery.createNewSessionToken(
                    req.app.locals.db.getSession,
                    req.app.locals.db.setSession,
                    req.body.signature,
                    account,
                );

                res.json({
                    token,
                });
            } catch (e) {
                console.log(e);
                next(e);
            }
        },
    );

    return router;
};
