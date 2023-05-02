import { EncryptionEnvelop } from 'dm3-lib-messaging';
import { log } from 'dm3-lib-shared';

import { io, Socket } from 'socket.io-client';

export const getDeliveryServiceWSClient = (
    deliveryServices: string[],
    onMessage: (encelop: EncryptionEnvelop) => any,
): Promise<Socket>[] => {
    return deliveryServices.map(async (url: string) => {
        const client = await new Promise<Socket>((res, rej) => {
            const c = io(url, {});
            c.on('connect', () => {
                log(`Connected to Delivery Service ${url}`);
                res(c);
            });
            c.on('connect_error', (err: any) => {
                log(`Connection error to Delivery Service ${url}`);
                rej(err);
            });
        });
        //register listners
        client.on('disconnect', () => {
            log(`disconnected from deliveryService ${url}`);
        });
        client.on('message', onMessage);

        //TODO impl disconnect handler

        return client;
    });
};
