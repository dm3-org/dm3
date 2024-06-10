import { logError } from '@dm3-org/dm3-lib-shared';
import webpush from 'web-push';
import { NotificationType } from '../types';

type UserWebPushConfig = {
    recipientValue: string;
    notificationType: NotificationType;
    notificationContent: any; // object that contains notification details
};

type PushNotificationServerConfig = {
    vapidEmailId: string;
    publicVapidKey: string;
    privateVapidKey: string;
};

// method to send web push notification
export function Push(serverConfig: PushNotificationServerConfig) {
    const send = async (config: UserWebPushConfig) => {
        try {
            const options = {
                vapidDetails: {
                    subject: serverConfig.vapidEmailId,
                    publicKey: serverConfig.publicVapidKey,
                    privateKey: serverConfig.privateVapidKey,
                },
            };

            const payload = JSON.stringify({
                body: `You received a new message from ${config.notificationContent.from}.`,
                title: 'New Message',
                image: 'https://framerusercontent.com/images/6kPsfvAEqACFXgMOWU539mUqfB0.png',
            });

            await webpush.sendNotification(
                JSON.parse(config.recipientValue),
                payload,
                options,
            );
        } catch (err) {
            logError('Send web push notification failed ' + err);
        }
    };

    return { send };
}
