import { Redis, RedisPrefix } from '../getDatabase';
import { countMessage, countNotification } from './setMetrics';

// these are currently not used, as the environment variables are loaded
// before the tests are run
// const intervalSeconds = 3600 * 48;
// const intervalRetentionCount = 10;
// process.env.METRICS_INTERVAL_SECONDS = `${intervalSeconds}`;
// process.env.METRICS_INTERVAL_RETENTION_COUNT = `${intervalRetentionCount}`;

describe('setMetrics', () => {
    let mockRedis: jest.Mocked<Redis>;
    const mockDate = new Date('2023-04-01T12:00:00Z');

    // const mockExpireDate = new Date(
    //     mockDate.getTime() + intervalSeconds * intervalRetentionCount * 1000,
    // );

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(mockDate);
        mockRedis = {
            incrBy: jest.fn().mockResolvedValue(1),
            expire: jest.fn().mockResolvedValue(1),
        } as unknown as jest.Mocked<Redis>;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('countMessage', () => {
        it('should increment message count and size, and set expiration', async () => {
            const messageSizeBytes = 100;
            const expectedTimestamp = '1680307200';

            const countMessageFunction = countMessage(mockRedis);

            await countMessageFunction(messageSizeBytes);

            expect(mockRedis.incrBy).toHaveBeenCalledTimes(2);
            expect(mockRedis.incrBy).toHaveBeenCalledWith(
                `${RedisPrefix.MetricsMessageCount}${expectedTimestamp}`,
                1,
            );
            expect(mockRedis.incrBy).toHaveBeenCalledWith(
                `${RedisPrefix.MetricsMessageSize}${expectedTimestamp}`,
                messageSizeBytes,
            );

            expect(mockRedis.expire).toHaveBeenCalledTimes(2);
            expect(mockRedis.expire).toHaveBeenCalledWith(
                `${RedisPrefix.MetricsMessageCount}${expectedTimestamp}`,
                864000,
            );
            expect(mockRedis.expire).toHaveBeenCalledWith(
                `${RedisPrefix.MetricsMessageSize}${expectedTimestamp}`,
                864000,
            );
        });
    });

    describe('countNotification', () => {
        it('should increment notification count and set expiration', async () => {
            const expectedTimestamp = '1680307200';

            const countNotificationFunction = countNotification(mockRedis);

            await countNotificationFunction();

            expect(mockRedis.incrBy).toHaveBeenCalledTimes(1);
            expect(mockRedis.incrBy).toHaveBeenCalledWith(
                `${RedisPrefix.MetricsNotificationCount}${expectedTimestamp}`,
                1,
            );

            expect(mockRedis.expire).toHaveBeenCalledTimes(1);
            expect(mockRedis.expire).toHaveBeenCalledWith(
                `${RedisPrefix.MetricsNotificationCount}${expectedTimestamp}`,
                864000,
            );
        });
    });
});
