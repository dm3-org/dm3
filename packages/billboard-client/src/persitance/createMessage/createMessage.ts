import { Message, schema } from '@dm3-org/dm3-lib-messaging';
import { stringify, validateSchema } from '@dm3-org/dm3-lib-shared';
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
    };
}
