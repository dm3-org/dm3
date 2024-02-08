import { Redis, RedisPrefix } from '../getDatabase';
export function syncAcknowledge(redis: Redis) {
    return async (conversationId: string, syncTime: number) => {
        await redis.zRemRangeByScore(
            RedisPrefix.Conversation + conversationId,
            0,
            syncTime,
        );
    };
}
