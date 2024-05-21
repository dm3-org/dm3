import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { stringify } from 'yaml';
import { getDeliveryServiceProperties } from './getDeliveryServiceProperties';
import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';

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
        });

        expect(config).toStrictEqual({
            messageTTL: 12345,
            sizeLimit: 456,
            notificationChannel: [],
        });
    });

    it('Returns Config from path', () => {
        writeFileSync(
            path,
            stringify({
                messageTTL: 12345,
                sizeLimit: 456,
                notificationChannel: [],
            }),
            { encoding: 'utf-8' },
        );
        const config = getDeliveryServiceProperties(path);

        expect(config).toStrictEqual({
            messageTTL: 12345,
            sizeLimit: 456,
            notificationChannel: [],
        });
    });
    it('Adds default properties if config.yml is not fully specified', () => {
        writeFileSync(
            path,
            stringify({
                messageTTL: 12345,
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
            }),
            { encoding: 'utf-8' },
        );
        const config = getDeliveryServiceProperties(path);

        expect(config).toStrictEqual({
            messageTTL: 12345,
            sizeLimit: 100000,
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
        });
    });
    it('Adds email channel from config.yml file & rest from default properties', () => {
        writeFileSync(
            path,
            stringify({
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
            }),
            { encoding: 'utf-8' },
        );
        const config = getDeliveryServiceProperties(path);

        expect(config).toStrictEqual({
            messageTTL: 0,
            sizeLimit: 100000,
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
        });
    });
});
