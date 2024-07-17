import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import { Redis, RedisPrefix } from '../getDatabase';
import { getMessages } from './getMessages';

export function getIncomingMessages(redis: Redis) {
    return async (
        ensName: string,
        limit: number,
    ): Promise<EncryptionEnvelop[]> => {
        const conversationIds = await redis.zRange(
            RedisPrefix.IncomingConversations + ensName,
            0,
            100,
            { REV: true },
        );

        console.log('conversationIds', conversationIds);

        //For each conversation we're fetching the latest messages
        const messages = await Promise.all(
            conversationIds.map((id) => getMessages(redis)(id, 0, limit)),
        );

        return messages.reduce((acc, cur) => [...acc, ...cur], []);
    };
}
