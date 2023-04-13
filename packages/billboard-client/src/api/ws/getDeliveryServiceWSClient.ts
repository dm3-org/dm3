import { io } from 'socket.io-client';
import * as Lib from 'dm3-lib/dist.backend';

export const getDeliveryServiceWSClient = (deliveryServices: string[]) => {
    const sockets = deliveryServices.map((deliveryService) => {
        const socket = io(deliveryService, {
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            Lib.log(`connected to deliveryService ${deliveryService}`);
        });

        socket.on('disconnect', () => {
            Lib.log(`disconnected from deliveryService ${deliveryService}`);
        });

        return socket;
    });

    return {
        onMessage: (
            callback: (message: Lib.messaging.EncryptionEnvelop) => void,
        ) => {
            sockets.forEach((socket) => {
                socket.on('message', callback);
            });
        },
    };
};
