import { DeliveryServiceProperties } from '@dm3-org/dm3-lib-delivery';
import {
    EncryptionEnvelop,
    getEnvelopSize,
    schema,
} from '@dm3-org/dm3-lib-messaging';
import { DeliveryServiceProfileKeys } from '@dm3-org/dm3-lib-profile';
import {
    IWebSocketManager,
    logError,
    validateSchema,
} from '@dm3-org/dm3-lib-shared';
import 'dotenv/config';
import { ethers } from 'ethers';
import express from 'express';
import { Server } from 'socket.io';
import { MessageProcessor } from '../../message/MessageProcessor';
import { IDatabase } from '../../persistence/getDatabase';
import { performance } from 'perf_hooks';

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

        console.warn({
            method: 'WS SUBMIT MESSAGE',
            error,
        });
        return res.status(400).send({ error });
    }

    const messageProcessor = new MessageProcessor(
        db,
        web3Provider,
        webSocketManager,
        deliveryServiceProperties,
        keys,
        (socketId: string, envelop: EncryptionEnvelop) => {
            io.sockets.to(socketId).emit('message', envelop);
        },
    );

    try {
        const startTime = performance.now();
        await messageProcessor.processEnvelop(envelop);

        const middleTime = performance.now();
        await db.countMessage(
            getEnvelopSize(envelop),
            deliveryServiceProperties,
        );
        const endTime = performance.now();
        const durationCountMessage = endTime - middleTime;
        const durationMessageProcessor = middleTime - startTime;
        console.log(
            `db.countMessage took ${durationCountMessage.toFixed(
                2,
            )} milliseconds, messageProcessor took ${durationMessageProcessor.toFixed(
                2,
            )} milliseconds. Total time: ${
                durationCountMessage + durationMessageProcessor
            } milliseconds`,
        );

        res.sendStatus(200);
    } catch (error) {
        console.error('handle submit message error');
        console.error(error);

        return res.status(400).send();
    }
}
