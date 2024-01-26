import { NotificationChannel } from './notifications/types';

export interface DeliveryServiceProperties {
    messageTTL: number;
    //Number of bytes an envelop object should not exceed
    sizeLimit: number;
    notificationChannel: NotificationChannel[];
    // properties for email service
    smtpHost: string;
    smtpPort: number;
    smtpEmail: string;
    smtpUsername: string;
    smtpPassword: string;
}
