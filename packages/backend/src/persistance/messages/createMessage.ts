import * as Lib from 'dm3-lib/dist.backend';
import { RedisPrefix } from '../../redis';
import { Redis } from '../getDatabase';

export function createMessage(redis: Redis) {
    return async (
        conversationId: string,
        envelop: Lib.messaging.EncryptionEnvelop,
    ) => {
        await redis.zAdd(RedisPrefix.Conversation + conversationId, {
            score: new Date().getTime(),
            value: Lib.stringify(envelop),
        });
    };
}
