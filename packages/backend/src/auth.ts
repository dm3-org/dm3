import * as Lib from 'dm3-lib/dist.backend';
import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';

const getChallengeSchema = {
    type: 'object',
    properties: {
        address: { type: 'string' },
    },
    required: ['address'],
    additionalProperties: false,
};

export default () => {
    const router = express.Router();

    //TODO remove
    router.use(cors());

    router.get('/:address', async (req, res, next) => {
        try {
            const isValidSchema = Lib.validateSchema(
                getChallengeSchema,
                req.params,
            );

            if (!isValidSchema || !ethers.utils.isAddress(req.params.address)) {
                console.log('INVALID SCHEMA');
                return res.send(400);
            }

            const account = Lib.external.formatAddress(req.params.address);

            const challenge = await Lib.delivery.createChallenge(
                req.app.locals.loadSession,
                req.app.locals.storeSession,
                account,
            );

            res.json({
                challenge,
            });
        } catch (e) {
            next(e);
        }
    });

    router.post('/:address', async (req, res, next) => {
        try {
            const account = Lib.external.formatAddress(req.params.address);

            const token = await Lib.delivery.createNewSessionToken(
                req.app.locals.loadSession,
                req.app.locals.storeSession,
                req.body.signature,
                account,
            );

            res.json({
                token,
            });
        } catch (e) {
            next(e);
        }
    });

    return router;
};
