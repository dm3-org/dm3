import { EncryptionEnvelop } from 'dm3-lib-messaging';
import { DeliveryServiceProfile } from 'dm3-lib-profile';
import { log } from 'dm3-lib-shared';

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
                const c = io(ds.url, {
                    auth: {
                        account: { ensName },
                        token: ds.token,
                    },
                });
                c.on('connect', () => {
                    log(`Connected to Delivery Service ${ds.url}`, 'info');
                    res(c);
                });
                c.on('connect_error', (err: any) => {
                    log(
                        `Connection error to Delivery Service ${ds.url} ` +
                            JSON.stringify(err),
                        'error',
                    );

                    rej(err);
                });
            });
            log(`Register listener`, 'info');
            //register listners
            client.on('disconnect', () => {
                log(`disconnected from deliveryService ${ds.url}`, 'info');
            });
            client.on('message', onMessage);

            //TODO impl disconnect handler

            return client;
        }),
    );
};
