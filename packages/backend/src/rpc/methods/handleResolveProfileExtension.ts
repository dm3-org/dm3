import { Axios } from 'axios';
import * as Lib from 'dm3-lib/dist.backend';
import express from 'express';
import { WithLocals } from '../../types';

export function handleResolveProfileExtension(axios: Axios) {
    return async (
        req: express.Request & { app: WithLocals },
        res: express.Response,
        next: express.NextFunction,
    ) => {
        const {
            params: [ensName],
        } = req.body;

        const normalizedEnsName = Lib.account.normalizeEnsName(ensName);

        //Get the Session to retrive profileExtension

        const session = await req.app.locals.db.getSession(normalizedEnsName);

        //The requesito ens-name it not known to the delivery service
        if (!session) {
            const error = 'unknown user';
            req.app.locals.logger.warn({
                method: 'RPC - RESOLVE PROFILE',
                error,
            });
            return res.status(400).send({ error });
        }

        const { profileExtension } = session;

        return res.status(200).send({
            jsonrpc: '2.0',
            result: Lib.stringify({ ...profileExtension }),
        });
    };
}
