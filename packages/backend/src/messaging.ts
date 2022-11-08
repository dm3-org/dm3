import { Socket } from 'socket.io';
import { Express } from 'express';
import * as Lib from 'dm3-lib/dist.backend';
import { addPending, RedisPrefix } from './redis';
import { stringify } from 'safe-stable-stringify';

const submitMessageSchema = {
    type: 'object',
    properties: {
        token: { type: 'string' },
        envelop: Lib.messaging.schema.EncryptionEnvelopeSchema,
    },
    required: ['token', 'envelop'],
    additionalProperties: false,
};
export function onConnection(app: Express) {
    return (socket: Socket) => {
        socket.on('disconnect', () => {
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
                    app.locals.logger.warn({
                        method: 'WS SUBMIT MESSAGE',
                        error,
                    });
                }
            },
        );

        socket.on('pendingMessage', async (data) => {
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
