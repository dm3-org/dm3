import { Redis, RedisPrefix } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export function getMessages(
    redis: Redis,
): (
    conversionId: string,
    offset: number,
    size: number,
) => Promise<Lib.messaging.EncryptionEnvelop[]> {
    return async (conversionId: string, offset: number, size: number) => {
        const messageStrings = await redis.zRange(
            RedisPrefix.Conversation + conversionId,
            offset,
            offset + size,
            { REV: true },
        );

        return messageStrings.map((m) => JSON.parse(m));
    };
}
