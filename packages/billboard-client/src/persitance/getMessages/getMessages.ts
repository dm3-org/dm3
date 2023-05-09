import { Message } from 'dm3-lib-messaging';
import { Redis, RedisPrefix } from '../getDatabase';

export function getMessages(redis: Redis) {
    return async (
        idBillboard: string,
        time?: number,
        limit: number = 100,
    ): Promise<Message[]> => {
        const start = time ?? 0; //The point the pagination should begin at

        //If start === 0 and stop === 0 fetch the latest 10 messages
        if (start === 0) {
            const serializedMessages = await redis.zRange(
                RedisPrefix.Messages + idBillboard,
                0,
                limit,
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
                    count: limit,
                },
            },
        );
        return serializedMessages.map(mapToMessage).reverse();
    };
}
const mapToMessage = (message: string) => JSON.parse(message) as Message;
