import { Socket } from 'socket.io';
import { Express } from 'express';
import * as Lib from 'ens-mail-lib';
import { addPending, RedisPrefix } from './redis';

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
            const account = Lib.formatAddress(data.accountAddress);
            const contact = Lib.formatAddress(data.contactAddress);
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
            } catch (e) {
                console.error(e);
            }
        });
    };
}
