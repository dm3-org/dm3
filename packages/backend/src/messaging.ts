import { Socket } from 'socket.io';
import { Express } from 'express';
import * as Lib from 'dm3-lib/dist.backend';
import { addPending, RedisPrefix } from './redis';

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
                    envelop: Lib.EncryptionEnvelop;
                    token: string;
                },
                callback,
            ) => {
                try {
                    app.locals.logger.info({
                        method: 'WS INCOMING MESSAGE',
                        account: data.envelop.from,
                    });
                    await Lib.Delivery.incomingMessage(
                        data,
                        app.locals.deliveryServicePrivateKey,
                        app.locals.loadSession,
                        async (
                            conversationId: string,
                            envelop: Lib.EncryptionEnvelop,
                        ) => {
                            if (app.locals.redisClient) {
                                await app.locals.redisClient.zAdd(
                                    RedisPrefix.Conversation + conversationId,
                                    {
                                        score: new Date().getTime(),
                                        value: JSON.stringify(envelop),
                                    },
                                );
                            } else {
                                throw Error('db not connected');
                            }
                        },
                        (socketId: string, envelop: Lib.EncryptionEnvelop) => {
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
            const account = Lib.formatAddress(data.accountAddress);
            const contact = Lib.formatAddress(data.contactAddress);
            app.locals.logger.info({
                method: 'WS PENDING MESSAGE',
                account,
                contact,
            });
            try {
                if (
                    await Lib.Delivery.checkToken(
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
