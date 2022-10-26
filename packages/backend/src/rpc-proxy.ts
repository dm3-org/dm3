import express from 'express';
import { Axios } from 'axios';
import 'dotenv/config';
import * as Lib from 'dm3-lib/dist.backend';

const DM3_SUBMIT_MESSAGE = 'dm3_submitMessage';

export default (axios: Axios) => {
    const router = express.Router();

    router.post('/', async (req, res, next) => {
        //RPC must be called with a method name
        if (req.body?.method === undefined) {
            return res.send(400);
        }

        const { method } = req.body;
        if (method === DM3_SUBMIT_MESSAGE) {
            return handleSubmitMessage(req, res, next);
        }
        return forwardToRpcNode(axios)(req, res, next);
    });
    return router;
};

const handleSubmitMessage = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {
    res.send(200);
};

const forwardToRpcNode =
    (axios: Axios) =>
    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        try {
            const envelop = '';
            const token = '';

            const deliveryServiceProfile = '';
            const getSession = (address: string) => {};
            const storeNewMessage = () => {};
            const send = () => {};
            /*  Lib.Delivery.incomingMessage(
            { envelop, token },
            deliveryServiceProfile,
            getSession,
            storeNewMessage,
        ); */

            const data = (await axios.post(process.env.RPC as string, req.body))
                .data;
            console.log('data ' + data);
            res.json(data);
        } catch (e) {
            next(e);
        }
    };
