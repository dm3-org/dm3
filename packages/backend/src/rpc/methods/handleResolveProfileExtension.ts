import express from 'express';
import * as Lib from 'dm3-lib/dist.backend';
import { WithLocals } from '../../types';
import { Axios } from 'axios';

export function handleResolveProfileExtension(axios: Axios) {
    return async (
        req: express.Request & { app: WithLocals },
        res: express.Response,
        next: express.NextFunction,
    ) => {
        const {
            params: [name],
        } = req.body;

        //Resolve the address of the provided ENS name
        const address = await req.app.locals.web3Provider.resolveName(name);
        if (!address) {
            const error = 'unknown ens-name';

            req.app.locals.logger.warn({
                method: 'RPC - RESOLVE PROFILE',
                error,
            });
            return res.status(400).send({ error });
        }

        //Get the Profile to retrive the mutableProfileExtensionUrl of the address
        const profile = await Lib.delivery.getUserProfile(
            req.app.locals.db.getSession,
            address,
        );

        if (!profile) {
            const error = 'unknown ens-name';

            req.app.locals.logger.warn({
                method: 'RPC - RESOLVE PROFILE',
                error,
            });
            return res.status(400).send({ error });
        }

        const { mutableProfileExtensionUrl } = profile.profile;

        //There is no mutableExtensionUrl specified within the profile. Hence the defaults values are beeing returned
        if (!mutableProfileExtensionUrl) {
            const defaultProfileExtension = getDefaultProfileExtension();
            return res.status(200).send({
                jsonrpc: '2.0',
                result: Lib.stringify({ ...defaultProfileExtension }),
            });
        }

        const profileExtension =
            await Lib.account.resolveMutableProfileExtension(
                mutableProfileExtensionUrl,
                async (url) => (await axios.get(url))?.data,
            );

        //The url points not to an valid profile Extension. Hence the default profileExtension is beeing returned
        if (!profileExtension) {
            const defaultProfileExtension = getDefaultProfileExtension();
            return res.status(200).send({
                jsonrpc: '2.0',
                result: Lib.stringify({ ...defaultProfileExtension }),
            });
        }

        return res.status(200).send({
            jsonrpc: '2.0',
            result: Lib.stringify({ ...profileExtension }),
        });
    };
    function getDefaultProfileExtension() {
        return {
            notSupportedMessageTypes: ['NEW'],
        } as Partial<Lib.account.MutableProfileExtension>;
    }
}
