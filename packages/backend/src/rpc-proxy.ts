import express from 'express';
import axios from 'axios';
import 'dotenv/config';
import * as Lib from 'dm3-lib/dist.backend';

const router = express.Router();

router.post('/', async (req, res, next) => {
    const envelop = '';
    const token = '';

    const deliveryServiceProfile = '';
    const getSession = (address: string) => {};
    const storeNewMessage = () => {};
    const send = () => {};

    try {
        Lib.Delivery.incomingMessage(
            { envelop, token },
            deliveryServiceProfile,
            getSession,
            storeNewMessage,
        );

        const data = (await axios.post(process.env.RPC as string, req.body))
            .data;
        console.log('data ' + data);
        res.json(data);
    } catch (e) {
        next(e);
    }
});

export default router;
