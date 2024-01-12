import { Redis, RedisPrefix } from '../getDatabase';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
export function syncAcknoledgment(redis: Redis) {
    return async (
        conversationId: string,
        ensName: string,
        lastMessagePull: string,
    ) => {
        const redisKey = RedisPrefix.Conversation + conversationId + ':sync';

        await redis.hSet(redisKey, normalizeEnsName(ensName), lastMessagePull);

        const syncTimestamps: string[] = Object.values(
            await redis.hGetAll(redisKey),
        );

        // TODO: check if both using this delivery service
        if (syncTimestamps.length === 2) {
            const lowestTimestamp =
                parseInt(syncTimestamps[0]) > parseInt(syncTimestamps[1])
                    ? parseInt(syncTimestamps[1])
                    : parseInt(syncTimestamps[0]);

            await redis.zRemRangeByScore(
                RedisPrefix.Conversation + conversationId,
                0,
                lowestTimestamp,
            );
        }
    };
}
