import { NotificationChannel, NotificationChannelType } from 'dm3-lib-delivery';
import winston from 'winston';
import { IDatabase, Redis, getDatabase, getRedisClient } from '../getDatabase';

const USER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';

describe('Set Users NotificationChannel', () => {
    let redisClient: Redis;
    let db: IDatabase;

    const logger = winston.createLogger({
        transports: [new winston.transports.Console()],
    });

    beforeEach(async () => {
        redisClient = await getRedisClient(logger);
        db = await getDatabase(logger, redisClient);
        await redisClient.flushDb();
    });

    afterEach(async () => {
        await redisClient.flushDb();
        await redisClient.disconnect();
    });

    it('Add Email Notification Channel ', async () => {
        const notificationChannel: NotificationChannel = {
            type: NotificationChannelType.EMAIL,
            config: {
                recipientAddress: 'foo@bar.de',
            },
        };

        const priorSetUsersNotificationChannel =
            await db.getUsersNotificationChannels(USER_ADDRESS);

        //User has no session yet
        expect(priorSetUsersNotificationChannel).toEqual([]);
        await db.addUsersNotificationChannel(USER_ADDRESS, notificationChannel);

        const afterSetSession = await db.getUsersNotificationChannels(
            USER_ADDRESS,
        );
        expect(afterSetSession).toEqual([notificationChannel]);
    });

    it('Rejcts Notification Channel with an invalid schema', async () => {
        try {
            const notificationChannel: any = {
                foo: NotificationChannelType.EMAIL,
                config: {
                    recipientAddress: 'foo@bar.de',
                },
            };

            await db.addUsersNotificationChannel(
                USER_ADDRESS,
                notificationChannel,
            );
            fail();
        } catch (e) {
            expect(e).toStrictEqual(Error('Invalid NotificationChannel'));
        }
    });
    it('Rejcts Email Notification Channel with an invalid config', async () => {
        try {
            const notificationChannel: any = {
                type: NotificationChannelType.EMAIL,
                config: {
                    foo: 'foo@bar.de',
                },
            };

            await db.addUsersNotificationChannel(
                USER_ADDRESS,
                notificationChannel,
            );
            fail();
        } catch (e) {
            expect(e).toStrictEqual(Error('Invalid Email config'));
        }
    });
    it('Rejcts Email Notification Channel with an invalid email address', async () => {
        try {
            const notificationChannel: any = {
                type: NotificationChannelType.EMAIL,
                config: {
                    recipientAddress: '12345',
                },
            };

            await db.addUsersNotificationChannel(
                USER_ADDRESS,
                notificationChannel,
            );
            fail();
        } catch (e) {
            expect(e).toStrictEqual(Error('Invalid Email config'));
        }
    });
});
