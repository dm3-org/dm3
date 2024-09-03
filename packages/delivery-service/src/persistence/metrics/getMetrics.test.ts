import { getMetrics } from './getMetrics';
import { Redis, RedisPrefix } from '../getDatabase';
import { MetricsMap, IntervalMetric } from './metricTypes';

describe('getMetrics', () => {
    let mockRedis: jest.Mocked<Redis>;

    beforeEach(() => {
        mockRedis = {
            keys: jest.fn(),
            get: jest.fn(),
        } as unknown as jest.Mocked<Redis>;
    });

    it('should return an empty map when no metrics are found', async () => {
        mockRedis.keys.mockResolvedValue([]);

        const getMetricsFunc = getMetrics(mockRedis);
        const result = await getMetricsFunc();

        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(0);
    });

    it('should correctly parse and return metrics', async () => {
        const timestamp = Math.floor(Date.now() / 1000);
        const mockKeys = [`${RedisPrefix.MetricsMessageCount}${timestamp}`];

        console.log('timestamp: ', timestamp);
        console.log('mockKeys: ', mockKeys);

        const date = new Date(timestamp * 1000);
        console.log('date: ', date);

        mockRedis.keys.mockResolvedValue(mockKeys);
        // @ts-ignore
        mockRedis.get.mockImplementation((key: string) => {
            if (key.includes(RedisPrefix.MetricsMessageCount))
                return Promise.resolve('10');
            if (key.includes(RedisPrefix.MetricsMessageSize))
                return Promise.resolve('1000');
            if (key.includes(RedisPrefix.MetricsNotificationCount))
                return Promise.resolve('5');
            return Promise.resolve(null);
        });

        const getMetricsFunc = getMetrics(mockRedis);
        const result = await getMetricsFunc();

        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(1);

        console.log('result: ', result);

        const expectedDate = new Date(timestamp * 1000);

        // Find the key that matches our expected date
        // javascript Date are checked by reference, not value, which is why
        // we need to do this.
        const matchingKey = Array.from(result.keys()).find(
            (key) => key.getTime() === expectedDate.getTime(),
        );

        if (!matchingKey) {
            throw new Error('Matching key not found');
        }

        const metric = result.get(matchingKey);

        console.log('metric: ', metric);

        expect(metric).toEqual({
            messageCount: 10,
            messageSizeBytes: 1000,
            notificationCount: 5,
        });
    });

    it('should handle missing metric values', async () => {
        const timestamp = Math.floor(Date.now() / 1000);
        const mockKeys = [`${RedisPrefix.MetricsMessageCount}${timestamp}`];

        mockRedis.keys.mockResolvedValue(mockKeys);
        mockRedis.get.mockResolvedValue(null);

        const getMetricsFunc = getMetrics(mockRedis);
        const result = await getMetricsFunc();

        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(1);

        const expectedDate = Array.from(result.keys())[0];
        const metric = result.get(expectedDate);

        expect(metric).toEqual({
            messageCount: 0,
            messageSizeBytes: 0,
            notificationCount: 0,
        });
    });
});
