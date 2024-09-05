import { getMetrics } from './getMetrics';
import { Redis, RedisPrefix } from '../getDatabase';
import { MetricsObject, IntervalMetric } from './metricTypes';

describe('getMetrics', () => {
    let mockRedis: jest.Mocked<Redis>;
    const mockDate = new Date('2023-04-01T12:00:00Z');
    //@ts-ignore
    const mockDeliveryServiceProperties: DeliveryServiceProperties = {
        metricsCollectionIntervalInSeconds: 3600,
        metricsRetentionDurationInSeconds: 864000,
    };

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(mockDate);
        mockRedis = {
            keys: jest.fn(),
            get: jest.fn(),
        } as unknown as jest.Mocked<Redis>;
    });

    it('should return an empty object when no metrics are found', async () => {
        mockRedis.keys.mockResolvedValue([]);

        const getMetricsFunc = getMetrics(mockRedis);
        const result = await getMetricsFunc(mockDeliveryServiceProperties);

        expect(result).toEqual({});
    });

    it('should return metrics for all available intervals', async () => {
        const mockKeys = Array.from({ length: 24 }, (_, i) => {
            const timestamp = 1680307200 - i * 3600;
            return `${RedisPrefix.MetricsMessageCount}${timestamp}`;
        });
        mockRedis.keys.mockResolvedValue(mockKeys);
        mockRedis.get.mockImplementation((key: string) => {
            if (key.includes(RedisPrefix.MetricsMessageCount))
                return Promise.resolve('10');
            if (key.includes(RedisPrefix.MetricsMessageSize))
                return Promise.resolve('1000');
            if (key.includes(RedisPrefix.MetricsNotificationCount))
                return Promise.resolve('5');
            return Promise.resolve(null);
        });

        const getMetricsFunction = getMetrics(mockRedis);
        const result = await getMetricsFunction(mockDeliveryServiceProperties);

        expect(mockRedis.keys).toHaveBeenCalledWith(
            `${RedisPrefix.MetricsMessageCount}*`,
        );
        expect(Object.keys(result)).toHaveLength(24);
        expect(result['2023-03-31T08:00:00.000Z']).toEqual({
            messageCount: 10,
            messageSizeBytes: 1000,
            notificationCount: 5,
        });
    });

    it('should handle missing data', async () => {
        mockRedis.keys.mockResolvedValue([
            `${RedisPrefix.MetricsMessageCount}1680307200`,
        ]);
        //@ts-ignore
        mockRedis.get.mockImplementation((key) => {
            console.log('key', key);
            //@ts-ignore
            const [prefix] = key.split(':');
            switch (prefix + ':') {
                case RedisPrefix.MetricsMessageCount:
                    return Promise.resolve('10');
                case RedisPrefix.MetricsMessageSize:
                    return Promise.resolve(null);
                case RedisPrefix.MetricsNotificationCount:
                    return Promise.resolve('5');
                default:
                    return Promise.resolve(null);
            }
        });

        const getMetricsFunction = getMetrics(mockRedis);
        const result = await getMetricsFunction(mockDeliveryServiceProperties);
        console.log(result);

        expect(Object.keys(result)).toHaveLength(1);

        expect(Object.keys(result)).toEqual(['2023-04-01T00:00:00.000Z']);

        expect(result['2023-04-01T00:00:00.000Z']).toEqual({
            messageCount: 10,
            messageSizeBytes: 0,
            notificationCount: 5,
        });
    });
});
