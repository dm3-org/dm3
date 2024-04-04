import { Axios } from 'axios';
import { stringify } from '@dm3-org/dm3-lib-shared';
import express from 'express';

export function handleResolveProfileExtension(axios: Axios) {
    return async (req: express.Request, res: express.Response) => {
        const {
            params: [ensName],
        } = req.body;

        const idEnsName = await req.app.locals.db.getIdEnsName(ensName);

        //Get the Session to retrive profileExtension

        const session = await req.app.locals.db.getSession(idEnsName);

        //The requesito ens-name it not known to the delivery service
        if (!session) {
            const error = 'unknown user';
            global.logger.warn({
                method: 'RPC - RESOLVE PROFILE',
                error,
            });
            return res.status(400).send({ error });
        }

        const { profileExtension } = session;

        return res.status(200).send({
            jsonrpc: '2.0',
            result: stringify({ ...profileExtension }),
        });
    };
}
