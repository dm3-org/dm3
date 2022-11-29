import { Socket } from 'socket.io';
import express from 'express';
import * as Lib from 'dm3-lib/dist.backend';
import { addPending, RedisPrefix } from './redis';
import { stringify } from 'safe-stable-stringify';
import { isAddress } from 'ethers/lib/utils';
import { WithLocals } from './types';

const submitMessageSchema = {
    type: 'object',
    properties: {
        token: { type: 'string' },
        envelop: Lib.messaging.schema.EncryptionEnvelopeSchema,
    },
    required: ['token', 'envelop'],
    additionalProperties: false,
};

const pendingMessageSchema = {
    type: 'object',
    properties: {
        accountAddress: { type: 'string' },
        contactAddress: { type: 'string' },
        token: { type: 'string' },
    },
    required: ['accountAddress', 'contactAddress', 'token'],
    additionalProperties: false,
};

export function onConnection(app: express.Application & WithLocals) {
    return (socket: Socket) => {
        socket.on('disconnect', () => {
            app;
            app.locals.logger.info({
                method: 'WS DISCONNECT',
                socketId: socket.id,
            });
        });

        socket.on(
            'submitMessage',
            async (
                data: {
                    envelop: Lib.messaging.EncryptionEnvelop;
                    token: string;
                },
                callback,
            ) => {
                try {
                    app.locals.logger.info({
                        method: 'WS INCOMING MESSAGE',
                    });

                    const isSchemaValid = Lib.validateSchema(
                        submitMessageSchema,
                        data,
                    );

                    if (!isSchemaValid) {
                        const error = 'invalid schema';

                        app.locals.logger.warn({
                            method: 'WS SUBMIT MESSAGE',
                            error,
                        });
                        return callback(error);
                    }

                    await Lib.delivery.incomingMessage(
                        data,
                        app.locals.keys.signing,
                        app.locals.keys.encryption,
                        app.locals.deliveryServiceProperties.sizeLimit,
                        app.locals.db.getSession,
                        app.locals.db.createMessage,
                        (
                            socketId: string,
                            envelop: Lib.messaging.EncryptionEnvelop,
                        ) => {
                            app.locals.io.sockets
                                .to(socketId)
                                .emit('message', envelop);
                        },
                    ),
                        callback('success');
                } catch (error) {
                    //TODO Should we use the callback function to return the error
                    app.locals.logger.warn({
                        method: 'WS SUBMIT MESSAGE',
                        error: (error as Error).toString(),
                    });
                }
            },
        );

        socket.on('pendingMessage', async (data, callback) => {
            const isSchemaValid = Lib.validateSchema(
                pendingMessageSchema,
                data,
            );

            const addressesAreValid =
                isAddress(data.accountAddress) &&
                isAddress(data.contactAddress);

            if (!isSchemaValid || !addressesAreValid) {
                const error = 'invalid schema';

                app.locals.logger.warn({
                    method: 'WS PENDING MESSAGE',
                    error,
                });

                return callback(error);
            }

            const account = Lib.external.formatAddress(data.accountAddress);
            const contact = Lib.external.formatAddress(data.contactAddress);
            app.locals.logger.info({
                method: 'WS PENDING MESSAGE',
                account,
                contact,
            });
            try {
                if (
                    await Lib.delivery.checkToken(
                        app.locals.db.getSession,
                        account,
                        data.token,
                    )
                ) {
                    await addPending(account, contact, app.locals.redisClient);
                } else {
                    throw Error('Token check failed');
                }
            } catch (error) {
                app.locals.logger.warn({
                    method: 'WS PRENDING MESSAGE',
                    error,
                });
            }
        });
    };
}
