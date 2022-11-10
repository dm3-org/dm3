import { Socket } from 'socket.io';
import express from 'express';
import * as Lib from 'dm3-lib/dist.backend';
import { addPending, RedisPrefix } from './redis';
import { stringify } from 'safe-stable-stringify';
import { isAddress } from 'ethers/lib/utils';

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

export function onConnection(app: express.Application) {
    return async (socket: Socket) => {
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
                        account: data.envelop.from,
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
                        app.locals.deliveryServicePrivateKey,
                        app.locals.deliveryServiceProperties.sizeLimit,
                        app.locals.loadSession,
                        async (
                            conversationId: string,
                            envelop: Lib.messaging.EncryptionEnvelop,
                        ) => {
                            if (app.locals.redisClient) {
                                await app.locals.redisClient.zAdd(
                                    RedisPrefix.Conversation + conversationId,
                                    {
                                        score: new Date().getTime(),
                                        value: stringify(envelop),
                                    },
                                );
                            } else {
                                throw Error('db not connected');
                            }
                        },
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
                        app.locals.loadSession,
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
