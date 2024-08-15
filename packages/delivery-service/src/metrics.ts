import express from 'express';
import { IDatabase } from './persistence/getDatabase';

export default (db: IDatabase) => {
    const router = express.Router();
    router.get('', async (req, res) => {
        //const [error, result] = await db.getMetrics();
        // if (error) {
        //     return res.status(500).send({ error });
        // }
        const result = await db.getMetrics();
        return res.status(200).send(result);
    });

    return router;
};
