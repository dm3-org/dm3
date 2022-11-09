import { log } from 'dm3-lib';
import express from 'express';

export function handleGetDeliveryServiceProperties(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) {
    const response = req.app.locals.deliveryServiceProperties;

    if (!response) {
        req.app.locals.logger.error({
            method: 'RPC GET DELIVERY SERVICE PROPERTIES',
            error: 'No Delivery Service Properties Set',
        });
        return res.send(400);
    }

    return res.status(200).send(response);
}
