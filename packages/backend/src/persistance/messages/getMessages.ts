import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import { Redis, RedisPrefix } from '../getDatabase';

export function getMessages(
    redis: Redis,
): (
    conversionId: string,
    offset: number,
    size: number,
) => Promise<EncryptionEnvelop[]> {
    return async (conversionId: string, offset: number, size: number) => {
        const messageStrings = await redis.zRange(
            RedisPrefix.Conversation + conversionId,
            offset,
            offset + size,
            { REV: true },
        );

        return messageStrings.map((m: string) => JSON.parse(m));
    };
}
