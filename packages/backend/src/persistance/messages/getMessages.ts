import { Redis } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';
import { RedisPrefix } from '../../redis';

export function getMessages(
    redis: Redis,
): (
    conversionId: string,
    min: number,
    max: number,
) => Promise<Lib.messaging.EncryptionEnvelop[]> {
    return async (conversionId: string, min: number, max: number) => {
        const messageStrings = await redis.zRange(
            RedisPrefix.Conversation + conversionId,
            min,
            max,
            { REV: true },
        );

        return messageStrings.map((m) => JSON.parse(m));
    };
}
