import { getMetrics } from './getMetrics';
import { Redis, RedisPrefix } from '../getDatabase';
import { MetricsObject, IntervalMetric } from './metricTypes';

describe('getMetrics', () => {
    let mockRedis: jest.Mocked<Redis>;

    beforeEach(() => {
        mockRedis = {
            keys: jest.fn(),
            get: jest.fn(),
        } as unknown as jest.Mocked<Redis>;
    });

    it('should return an empty object when no metrics are found', async () => {
        mockRedis.keys.mockResolvedValue([]);

        const getMetricsFunc = getMetrics(mockRedis);
        const result = await getMetricsFunc();

        expect(result).toEqual({});
    });

    it('should correctly parse and return metrics', async () => {
        const timestamp = Math.floor(Date.now() / 1000) - 86400; // Use yesterday's timestamp
        const mockKeys = [`${RedisPrefix.MetricsMessageCount}${timestamp}`];

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

        const getMetricsFunc = getMetrics(mockRedis);
        const result = await getMetricsFunc();

        expect(Object.keys(result).length).toBe(1);

        const expectedDate = new Date(timestamp * 1000).toISOString();
        const metric = result[expectedDate];

        expect(metric).toEqual({
            messageCount: 10,
            messageSizeBytes: 1000,
            notificationCount: 5,
        });
    });

    it('should handle missing metric values', async () => {
        const timestamp = Math.floor(Date.now() / 1000) - 86400; // Use yesterday's timestamp
        const mockKeys = [`${RedisPrefix.MetricsMessageCount}${timestamp}`];

        mockRedis.keys.mockResolvedValue(mockKeys);
        mockRedis.get.mockResolvedValue(null);

        const getMetricsFunc = getMetrics(mockRedis);
        const result = await getMetricsFunc();

        expect(Object.keys(result).length).toBe(1);

        const expectedDate = new Date(timestamp * 1000).toISOString();
        const metric = result[expectedDate];

        expect(metric).toEqual({
            messageCount: 0,
            messageSizeBytes: 0,
            notificationCount: 0,
        });
    });
});
