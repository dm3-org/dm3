import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { stringify } from 'yaml';
import { getDeliveryServiceProperties } from './getDeliveryServiceProperties';
import { NotificationChannelType } from '@dm3-org/dm3-lib-delivery';

describe('ReadDeliveryServiceProperties', () => {
    let path: string;
    beforeEach(() => {
        path = resolve(__dirname, './config.test.yml');
    });

    afterEach(() => {
        if (existsSync(path)) {
            unlinkSync(path);
        }
    });

    it('Returns default DeliveryServiceProfile if config file is undefined', () => {
        const config = getDeliveryServiceProperties('/unknown-path', {
            messageTTL: 12345,
            sizeLimit: 456,
            notificationChannel: [],
            smtpHost: 'smtp.host',
            smtpPort: 587,
            smtpEmail: 'dm3@gmail.com',
            smtpUsername: 'dm3@gmail.com',
            smtpPassword: 'dm312345',
        });

        expect(config).toStrictEqual({
            messageTTL: 12345,
            sizeLimit: 456,
            notificationChannel: [],
            smtpHost: 'smtp.host',
            smtpPort: 587,
            smtpEmail: 'dm3@gmail.com',
            smtpUsername: 'dm3@gmail.com',
            smtpPassword: 'dm312345',
        });
    });

    it('Returns Config from path', () => {
        writeFileSync(
            path,
            stringify({
                messageTTL: 12345,
                sizeLimit: 456,
                notificationChannel: [
                    {
                        type: NotificationChannelType.EMAIL,
                        config: {
                            host: 'mail.alice.com',
                            port: 465,
                            secure: true,
                            auth: {
                                user: 'foo',
                                pass: 'bar',
                            },
                            senderAddress: 'mail@dm3.io',
                        },
                    },
                ],
                smtpHost: 'smtp.host',
                smtpPort: 587,
                smtpEmail: 'dm3@gmail.com',
                smtpUsername: 'dm3@gmail.com',
                smtpPassword: 'dm312345',
            }),
            { encoding: 'utf-8' },
        );
        const config = getDeliveryServiceProperties(path);

        expect(config).toStrictEqual({
            messageTTL: 12345,
            sizeLimit: 456,
            notificationChannel: [
                {
                    type: NotificationChannelType.EMAIL,
                    config: {
                        host: 'mail.alice.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: 'foo',
                            pass: 'bar',
                        },
                        senderAddress: 'mail@dm3.io',
                    },
                },
            ],
            smtpHost: 'smtp.host',
            smtpPort: 587,
            smtpEmail: 'dm3@gmail.com',
            smtpUsername: 'dm3@gmail.com',
            smtpPassword: 'dm312345',
        });
    });
    it('Adds default properties if config.yml is not fully specified', () => {
        writeFileSync(
            path,
            stringify({
                messageTTL: 12345,
                smtpHost: 'smtp.host',
                smtpPort: 587,
                smtpEmail: 'dm3@gmail.com',
                smtpUsername: 'dm3@gmail.com',
                smtpPassword: 'dm312345',
            }),
            { encoding: 'utf-8' },
        );
        const config = getDeliveryServiceProperties(path);

        expect(config).toStrictEqual({
            messageTTL: 12345,
            sizeLimit: 100000,
            notificationChannel: [],
            smtpHost: 'smtp.host',
            smtpPort: 587,
            smtpEmail: 'dm3@gmail.com',
            smtpUsername: 'dm3@gmail.com',
            smtpPassword: 'dm312345',
        });
    });
});
