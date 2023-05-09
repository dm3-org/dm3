import { Message } from 'dm3-lib-messaging';
import { Redis, RedisPrefix } from '../getDatabase';

export function getMessages(redis: Redis) {
    return async (
        idBillboard: string,
        time?: number,
        idMessageCursor?: string,
    ): Promise<Message[]> => {
        const start = idMessageCursor ?? 0; //The point the pagination should begin
        const stop = time ?? 0; //The end where the messages should be fetched

        //If start ===0 and stop ===0 fetch the latest 10 messages

        if (start === 0 && stop === 0) {
            const serializedMessages = await redis.zRange(
                RedisPrefix.Messages + idBillboard,
                0,
                9,
                {
                    REV: true,
                },
            );
            return serializedMessages.map((m) => JSON.parse(m)) as Message[];
        }

        throw 'unimplemented';
    };
}
