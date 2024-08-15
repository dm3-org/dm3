import express from 'express';
import { IDatabase } from './persistence/getDatabase';
import { stringifyMetrics } from './persistence/metrics/stringifyMetrics';

/**
 * The metrics endpoint returns the metrics of the delivery service.
 * These can include the number of messages received, the cumulative size of messages received, etc.,
 * over a certain period of time.
 * @param db The database object.
 */
export default (db: IDatabase) => {
    const router = express.Router();
    router.get('', async (req, res) => {
        const metrics = await db.getMetrics();

        return res.status(200).send(stringifyMetrics(metrics));
    });

    return router;
};
