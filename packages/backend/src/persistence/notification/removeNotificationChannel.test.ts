import winston from 'winston';
import { IDatabase, Redis, getDatabase, getRedisClient } from '../getDatabase';
import { NotificationChannelType, NotificationChannel } from '@dm3-org/dm3-lib-shared';

const USER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';

global.logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});

describe('Removes EMAIL notification channel', () => {
    let redisClient: Redis;
    let db: IDatabase;

    beforeEach(async () => {
        redisClient = await getRedisClient();
        db = await getDatabase(redisClient);
        await redisClient.flushDb();
    });

    afterEach(async () => {
        await redisClient.flushDb();
        await redisClient.disconnect();
    });

    it('Removes EMAIL notification channel of specific ENS name', async () => {
        const notificationChannel: NotificationChannel = {
            type: NotificationChannelType.EMAIL,
            config: {
                recipientValue: 'foo@bar.de',
            },
        };

        // add EMAIL notification channel
        await db.addUsersNotificationChannel(USER_ADDRESS, notificationChannel);

        const expectedNotificationChannels = [
            {
                type: NotificationChannelType.EMAIL,
                config: {
                    recipientValue: 'foo@bar.de',
                    isEnabled: true,
                    isVerified: false,
                },
            },
        ];

        // fetch notification channels
        const notificationChannels = await db.getUsersNotificationChannels(
            USER_ADDRESS,
        );

        // expects to have EMAIL notification channel
        expect(expectedNotificationChannels).toEqual(notificationChannels);

        // removes EMAIL notification channel
        await db.removeNotificationChannel(
            USER_ADDRESS,
            NotificationChannelType.EMAIL,
        );

        // fetch notification channels
        const notificationChannelsAfterRemoval =
            await db.getUsersNotificationChannels(USER_ADDRESS);

        // expects to have notification channel as empty array
        expect(notificationChannelsAfterRemoval).toEqual([]);
    });
});
