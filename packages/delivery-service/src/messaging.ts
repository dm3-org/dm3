import { Socket, Server } from 'socket.io';
import express from 'express';
import { getDeliveryServiceProperties } from './config/getDeliveryServiceProperties';
import { validateSchema } from '@dm3-org/dm3-lib-shared';
import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { schema, checkToken, incomingMessage } from '@dm3-org/dm3-lib-delivery';
import { getWeb3Provider, readKeysFromEnv } from '@dm3-org/dm3-lib-server-side';
import { getDatabase } from './persistence/getDatabase';

const pendingMessageSchema = {
    type: 'object',
    properties: {
        ensName: { type: 'string' },
        contactEnsName: { type: 'string' },
        token: { type: 'string' },
    },
    required: ['ensName', 'contactEnsName', 'token'],
    additionalProperties: false,
};

export function onConnection(app: express.Application, io: Server) {
    return (socket: Socket) => {
        socket.on('disconnect', () => {
            global.logger.info({
                method: 'WS DISCONNECT',
                socketId: socket.id,
            });
        });

        socket.on(
            'submitMessage',
            async (
                data: {
                    envelop: EncryptionEnvelop;
                    token: string;
                },
                callback,
            ) => {
                try {
                    const keys = readKeysFromEnv(process.env);
                    const deliveryServiceProperties =
                        getDeliveryServiceProperties();
                    const db = await getDatabase();
                    const web3Provider = await getWeb3Provider(process.env);
                    global.logger.info({
                        method: 'WS INCOMING MESSAGE',
                    });

                    const isSchemaValid = validateSchema(
                        schema.MessageSubmission,
                        data,
                    );

                    if (!isSchemaValid) {
                        const error = 'invalid schema';

                        global.logger.warn({
                            method: 'WS SUBMIT MESSAGE',
                            error,
                        });
                        return callback({ error });
                    }

                    global.logger.info({
                        method: 'WS INCOMING MESSAGE',
                        keys: keys.encryption,
                    });

                    await incomingMessage(
                        data,
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
                    ),
                        callback({ response: 'success' });
                } catch (error: any) {
                    global.logger.warn({
                        method: 'WS SUBMIT MESSAGE',
                        error: (error as Error).toString(),
                    });
                    return callback({ error: error.message });
                }
            },
        );

        socket.on('pendingMessage', async (data, callback) => {
            const isSchemaValid = validateSchema(pendingMessageSchema, data);
            const db = await getDatabase();

            if (!isSchemaValid) {
                const error = 'invalid schema';

                global.logger.warn({
                    method: 'WS PENDING MESSAGE',
                    error,
                });

                return callback({ error });
            }

            let idEnsName: string;
            let idContactEnsName: string;
            const ensName = normalizeEnsName(data.ensName);
            const contactEnsName = normalizeEnsName(data.contactEnsName);

            try {
                idEnsName = await db.getIdEnsName(ensName);
                idContactEnsName = await db.getIdEnsName(contactEnsName);
            } catch (error) {
                global.logger.warn({
                    method: 'WS PENDING MESSAGE',
                    error,
                });

                return callback({ error });
            }

            global.logger.info({
                method: 'WS PENDING MESSAGE',
                ensName,
                contactEnsName,
            });
            const web3Provider = await getWeb3Provider(process.env);
            try {
                if (
                    !(await checkToken(
                        web3Provider,
                        db.getSession,
                        idEnsName,
                        data.token,
                    ))
                ) {
                    const error = 'Token check failed';
                    global.logger.warn({
                        method: 'WS PENDING MESSAGE',
                        error,
                    });
                    return callback({ error });
                }

                await db.addPending(ensName, idContactEnsName);

                callback({ response: 'success' });
            } catch (error) {
                global.logger.warn({
                    method: 'WS PENDING MESSAGE',
                    error: (error as Error).toString(),
                });

                return callback({ error: "Can't add pending message" });
            }
        });
    };
}
