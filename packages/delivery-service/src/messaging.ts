import { checkToken, incomingMessage } from '@dm3-org/dm3-lib-delivery';
import { EncryptionEnvelop, schema } from '@dm3-org/dm3-lib-messaging';
import {
    DeliveryServiceProfileKeys,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { validateSchema } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { Server, Socket } from 'socket.io';
import { getDeliveryServiceProperties } from './config/getDeliveryServiceProperties';
import { IDatabase } from './persistence/getDatabase';

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

export function onConnection(
    io: Server,
    web3Provider: ethers.providers.JsonRpcProvider,
    db: IDatabase,
    keys: DeliveryServiceProfileKeys,
) {
    return (socket: Socket) => {
        socket.on('disconnect', () => {
            global.logger.info({
                method: 'WS DISCONNECT',
                socketId: socket.id,
            });
        });

        /**
         * Transfer an encrypted message to the delivery service the recipient uses
         */
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
                    const deliveryServiceProperties =
                        getDeliveryServiceProperties();
                    global.logger.info({
                        method: 'WS INCOMING MESSAGE',
                    });

                    const isSchemaValid = validateSchema(
                        schema.EncryptionEnvelopeSchema,
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
                        keys: keys.encryptionKeyPair.publicKey,
                    });

                    await incomingMessage(
                        data.envelop,
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

        /**
         * Queue a message for a user that has not yet published their profile.
         * The queue is managed on the delivery service of the sending user.
         */
        socket.on('pendingMessage', async (data, callback) => {
            const isSchemaValid = validateSchema(pendingMessageSchema, data);

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
