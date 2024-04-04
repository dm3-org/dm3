import {
    schema,
    incomingMessage,
    DeliveryServiceProperties,
} from '@dm3-org/dm3-lib-delivery';
import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import { validateSchema, logError } from '@dm3-org/dm3-lib-shared';
import { getWeb3Provider, readKeysFromEnv } from '@dm3-org/dm3-lib-server-side';
import 'dotenv/config';
import express from 'express';
import { Server } from 'socket.io';
import { getDatabase } from '../../persistence/getDatabase';

export async function handleSubmitMessage(
    req: express.Request,
    res: express.Response,
    io: Server,
    deliveryServiceProperties: DeliveryServiceProperties,
) {
    const {
        params: [stringifiedEnvelop, token],
    } = req.body;

    const envelop = JSON.parse(stringifiedEnvelop);

    if (!token) {
        logError('Auth token missing');
        return res.status(400).send('Auth token missing');
    }

    if (!envelop) {
        logError('Envelop missing');

        return res.status(400).send('Envelop missing');
    }

    const isSchemaValid = validateSchema(schema.MessageSubmission, {
        envelop,
        token,
    });

    if (!isSchemaValid) {
        const error = 'invalid schema';

        global.logger.warn({
            method: 'WS SUBMIT MESSAGE',
            error,
        });
        return res.status(400).send({ error });
    }

    const db = await getDatabase();
    const keys = readKeysFromEnv(process.env);
    const web3Provider = await getWeb3Provider(process.env);

    try {
        await incomingMessage(
            { envelop, token },
            keys.signing,
            keys.encryption,
            deliveryServiceProperties.sizeLimit,
            deliveryServiceProperties.notificationChannel,
            db.getSession,
            db.createMessage,
            (socketId: string, envelop: EncryptionEnvelop) => {
                io.sockets.to(socketId).emit('message', envelop);
            },
            web3Provider,
            db.getIdEnsName,
            db.getUsersNotificationChannels,
        );
        res.send(200);
    } catch (error) {
        global.logger.warn({
            method: 'RPC SUBMIT MESSAGE',
            error: JSON.stringify(error),
        });
        logError({
            text: '[handleSubmitMessage]',
            error,
        });

        return res.status(400).send();
    }
}
