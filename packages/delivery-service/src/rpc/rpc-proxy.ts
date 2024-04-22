import { DeliveryServiceProperties } from '@dm3-org/dm3-lib-delivery';
import { Axios } from 'axios';
import 'dotenv/config';
import { ethers } from 'ethers';
import express from 'express';
import { Server } from 'socket.io';
import { handleGetDeliveryServiceProperties } from './methods/handleGetDeliveryServiceProperties';
import { handleResolveProfileExtension } from './methods/handleResolveProfileExtension';
import { handleSubmitMessage } from './methods/handleSubmitMessage';
import { IDatabase } from '../persistence/getDatabase';
import { DeliveryServiceProfileKeys } from '@dm3-org/dm3-lib-profile';

const DM3_SUBMIT_MESSAGE = 'dm3_submitMessage';
const DM3_GET_DELIVERY_SERVICE_PROPERTIES = 'dm3_getDeliveryServiceProperties';
const DM3_GET_PROFILE_EXTENSION = 'dm3_getProfileExtension';

export default (
    axios: Axios,
    deliveryServiceProperties: DeliveryServiceProperties,
    io: Server,
    web3Provider: ethers.providers.JsonRpcProvider,
    db: IDatabase,
    keys: DeliveryServiceProfileKeys,
) => {
    const router = express.Router();

    router.post('/', async (req, res, next) => {
        //RPC must be called with a method name
        if (req.body?.method === undefined) {
            return res.sendStatus(400);
        }

        const { method } = req.body;

        switch (method) {
            case DM3_SUBMIT_MESSAGE:
                return handleSubmitMessage(
                    req as express.Request,
                    res,
                    io,
                    deliveryServiceProperties,
                    web3Provider,
                    db,
                    keys,
                );

            case DM3_GET_DELIVERY_SERVICE_PROPERTIES:
                return handleGetDeliveryServiceProperties(
                    req,
                    res,
                    deliveryServiceProperties,
                );

            case DM3_GET_PROFILE_EXTENSION:
                return handleResolveProfileExtension(axios, db)(
                    req as express.Request,
                    res,
                );

            default:
                return forwardToRpcNode(axios)(req, res, next);
        }
    });
    return router;
};

const forwardToRpcNode =
    (axios: Axios) =>
    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        global.logger.info('Forward method to rpc url');
        try {
            const data = (await axios.post(process.env.RPC as string, req.body))
                .data;
            res.json(data);
        } catch (e) {
            next(e);
        }
    };
