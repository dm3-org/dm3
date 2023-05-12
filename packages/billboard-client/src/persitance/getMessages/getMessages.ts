import { Message } from 'dm3-lib-messaging';
import { Redis, RedisPrefix } from '../getDatabase';

const DEFAULT_PAGE_SIZE = 100;

export function getMessages(redis: Redis) {
    return async (
        idBillboard: string,
        time?: number,
        limit?: number,
    ): Promise<Message[]> => {
        const _limit = !!limit ? limit : DEFAULT_PAGE_SIZE;

        //If start === 0 and fetch the latest 10 messages
        if (!time) {
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
            time ?? 0,
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
