import { DeliveryServiceProperties } from '@dm3-org/dm3-lib-delivery';
import express from 'express';
import { IDatabase } from './persistence/getDatabase';
/**
 * The metrics endpoint returns the metrics of the delivery service.
 * These can include the number of messages received, the cumulative size of messages received, etc.,
 * over a certain period of time.
 * @param db The database object.
 */
export default (
    db: IDatabase,
    deliveryServiceProperties: DeliveryServiceProperties,
) => {
    const router = express.Router();
    router.get('', async (req, res) => {
        const metrics = await db.getMetrics(deliveryServiceProperties);

        return res.status(200).send(JSON.stringify(metrics));
    });

    return router;
};
