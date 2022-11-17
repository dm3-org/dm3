import * as Lib from 'dm3-lib/dist.backend';
import { RedisPrefix } from '../../redis';
import { Redis } from '../getDatabase';

export function deleteExpiredMessages(
    redisClient: Redis,
): (time: number) => Promise<void> {
    return async (time: number) => {
        const conversions = await redisClient.keys(
            RedisPrefix.Conversation + '*',
        );

        const now = new Date().getTime();

        await Promise.all(
            conversions.map((conversion) =>
                redisClient.zRemRangeByScore(conversion, 0, time),
            ),
        );
    };
}
