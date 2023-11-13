import { Message, schema } from 'dm3-lib-messaging';
import { stringify, validateSchema } from 'dm3-lib-shared';
import { Redis, RedisPrefix } from '../getDatabase';

export function createMessage(redis: Redis) {
    return async (idBillboard: string, message: Message) => {
        const isValid = validateSchema(schema.MessageSchema, message);

        if (!isValid) {
            throw Error('Invalid message');
        }

        await redis.zAdd(RedisPrefix.Messages + idBillboard, {
            score: message.metadata.timestamp,
            value: stringify(message),
        });

        console.log('message added', message);

        const msgs = await redis.zRange(
            RedisPrefix.Messages + idBillboard,
            0,
            100,
            {
                REV: true,
            },
        );

        console.log("msgs", msgs);
    };
}
