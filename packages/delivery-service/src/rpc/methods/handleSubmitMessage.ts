import {
    incomingMessage,
    DeliveryServiceProperties,
} from '@dm3-org/dm3-lib-delivery';
import { EncryptionEnvelop, schema } from '@dm3-org/dm3-lib-messaging';
import { validateSchema, logError } from '@dm3-org/dm3-lib-shared';
import 'dotenv/config';
import express from 'express';
import { Server } from 'socket.io';
import { IDatabase } from '../../persistence/getDatabase';
import { ethers } from 'ethers';
import { DeliveryServiceProfileKeys } from '@dm3-org/dm3-lib-profile';
import { IWebSocketManager } from '@dm3-org/dm3-lib-shared';

export async function handleSubmitMessage(
    req: express.Request,
    res: express.Response,
    io: Server,
    deliveryServiceProperties: DeliveryServiceProperties,
    web3Provider: ethers.providers.JsonRpcProvider,
    db: IDatabase,
    keys: DeliveryServiceProfileKeys,
    webSocketManager: IWebSocketManager,
) {
    const {
        params: [stringifiedEnvelop],
    } = req.body;

    if (!stringifiedEnvelop) {
        logError('Envelop missing');

        return res.status(400).send('Envelop missing');
    }

    let envelop;
    try {
        envelop = JSON.parse(stringifiedEnvelop);
    } catch (error) {
        logError('Error parsing envelop');

        return res.status(400).send('Error parsing envelop');
    }

    const isSchemaValid = validateSchema(
        schema.EncryptionEnvelopeSchema,
        envelop,
    );

    if (!isSchemaValid) {
        const error = 'invalid schema';

        global.logger.warn({
            method: 'WS SUBMIT MESSAGE',
            error,
        });
        return res.status(400).send({ error });
    }

    try {
        await incomingMessage(
            envelop,
            keys.signingKeyPair,
            keys.encryptionKeyPair,
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
            webSocketManager,
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
        console.log('handle submit message error');
        console.error(error);

        return res.status(400).send();
    }
}
