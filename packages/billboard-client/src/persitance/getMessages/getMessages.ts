import { Message } from 'dm3-lib-messaging';
import { Redis, RedisPrefix } from '../getDatabase';

const DEFAULT_PAGE_SIZE = 100;

export function getMessages(redis: Redis) {
    return async (
        idBillboard: string,
        time?: number,
        limit?: number,
    ): Promise<Message[]> => {
        const start = time ?? 0;
        const _limit = !!limit ? limit : DEFAULT_PAGE_SIZE;

        //If start === 0 and stop === 0 fetch the latest 10 messages
        if (start === 0) {
            const serializedMessages = await redis.zRange(
                RedisPrefix.Messages + idBillboard,
                0,
                _limit,
                {
                    REV: true,
                },
            );
            return serializedMessages.map(mapToMessage).reverse();
        }
        const serializedMessages = await redis.zRange(
            RedisPrefix.Messages + idBillboard,
            start,
            0,
            {
                REV: true,
                BY: 'SCORE',
                LIMIT: {
                    offset: 0,
                    count: _limit,
                },
            },
        );
        return serializedMessages.map(mapToMessage).reverse();
    };
}
const mapToMessage = (message: string) => JSON.parse(message) as Message;
