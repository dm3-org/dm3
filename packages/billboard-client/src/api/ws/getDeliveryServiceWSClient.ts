import { EncryptionEnvelop } from 'dm3-lib-messaging';
import { log } from 'dm3-lib-shared';
import { io } from 'socket.io-client';

export const getDeliveryServiceWSClient = (deliveryServices: string[]) => {
    const sockets = deliveryServices.map((deliveryService) => {
        const socket = io(deliveryService, {
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            log(`connected to deliveryService ${deliveryService}`);
        });

        socket.on('disconnect', () => {
            log(`disconnected from deliveryService ${deliveryService}`);
        });

        return socket;
    });

    return {
        onMessage: (callback: (message: EncryptionEnvelop) => void) => {
            sockets.forEach((socket) => {
                socket.on('message', callback);
            });
        },
    };
};
