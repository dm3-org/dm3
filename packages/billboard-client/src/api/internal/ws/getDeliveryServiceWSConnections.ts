import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import { DeliveryServiceProfile } from '@dm3-org/dm3-lib-profile';
import { logError, logInfo } from '@dm3-org/dm3-lib-shared';

import { io, Socket } from 'socket.io-client';

export const getDeliveryServiceWSClient = (
    deliveryServices: (DeliveryServiceProfile & {
        token: string;
    })[],
    onMessage: (encelop: EncryptionEnvelop) => any,
    ensName: string,
): Promise<Socket[]> => {
    return Promise.all(
        deliveryServices.map(async (ds) => {
            const client = await new Promise<Socket>((res, rej) => {
                const c = io(ds.url.replace('/api', ''), {
                    auth: {
                        account: { ensName },
                        token: ds.token,
                    },
                });
                c.on('connect', () => {
                    logInfo({
                        text: `Connected to Delivery Service`,
                        dsUrl: ds.url,
                    });
                    res(c);
                });
                c.on('connect_error', (error: any) => {
                    logError({
                        text: `Connection error to Delivery Service`,
                        dsUrl: ds.url,
                        error,
                    });

                    rej(error);
                });
            });
            logInfo(`Register listener`);
            //register listners
            client.on('disconnect', () => {
                logInfo({
                    text: `disconnected from deliveryService `,
                    dsUrl: ds.url,
                });
            });
            client.on('message', onMessage);

            //TODO impl disconnect handler

            return client;
        }),
    );
};
