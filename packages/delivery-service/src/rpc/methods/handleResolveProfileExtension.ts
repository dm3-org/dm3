import { Axios } from 'axios';
import { stringify } from '@dm3-org/dm3-lib-shared';
import express from 'express';
import { IDatabase } from '../../persistence/getDatabase';

export function handleResolveProfileExtension(axios: Axios, db: IDatabase) {
    return async (req: express.Request, res: express.Response) => {
        const {
            params: [ensName],
        } = req.body;
        const idEnsName = await db.getIdEnsName(ensName);

        //Get the Session to retrieve profileExtension
        const session = await db.getAccount(idEnsName);

        if (!session) {
            //The requested ens-name is not known to the delivery service
            const error = 'unknown user';
            console.warn({
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
