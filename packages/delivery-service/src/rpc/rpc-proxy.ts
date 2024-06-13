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
import { IWebSocketManager } from '@dm3-org/dm3-lib-shared';

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
    webSocketManager: IWebSocketManager,
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
                    webSocketManager,
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
                return res.status(405).send({ error: 'Method not allowed' });
        }
    });
    return router;
};
