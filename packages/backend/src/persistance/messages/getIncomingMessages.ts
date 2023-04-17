import { Redis, RedisPrefix } from '../getDatabase';
import { getMessages } from './getMessages';
import * as Lib from 'dm3-lib/dist.backend';

export function getIncomingMessages(redis: Redis) {
    return async (
        ensName: string,
        limit: number,
    ): Promise<Lib.messaging.EncryptionEnvelop[]> => {
        const conversationIds = await redis.zRange(
            RedisPrefix.IncomingConversations + ensName,
            0,
            100,
            { REV: true },
        );

        //For each conversation we're fetching the last 10 messages
        const conversations = await Promise.all(
            conversationIds.map((id) => getMessages(redis)(id, 0, limit)),
        );

        return conversations.reduce((acc, cur) => [...acc, ...cur], []);
    };
}
