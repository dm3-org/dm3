import { Socket } from 'socket.io';
import { Express } from 'express';
import * as Lib from 'ens-mail-lib';
import { RedisPrefix } from './redis';

export function onConnection(app: Express) {
    return (socket: Socket) => {
        Lib.log('[WS] a user connected');
        socket.on('disconnect', () => {
            Lib.log('[WS] user disconnected');
        });
        socket.on('disconnect', () => {
            Lib.log('[WS] user disconnected');
        });
        socket.on('submitMessage', async (data, callback) => {
            try {
                await Lib.Delivery.incomingMessage(
                    data,
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
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('pendingMessage', async (data) => {
            try {
                app.locals.pendingConversations =
                    await Lib.Delivery.createPendingEntry(
                        data.accountAddress,
                        data.contactAddress,
                        data.token,
                        app.locals.loadSession,
                        app.locals.pendingConversations,
                    );
            } catch (e) {
                console.error(e);
            }
        });
    };
}
