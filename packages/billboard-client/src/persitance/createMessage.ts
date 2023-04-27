import { EncryptionEnvelop, schema } from 'dm3-lib-messaging';
import { Redis, RedisPrefix } from './getDatabase';
import { stringify, validateSchema } from 'dm3-lib-shared';

export function createMessage(redis: Redis) {
    return async (
        envelop: EncryptionEnvelop,
        createdAt: number = new Date().getTime(),
    ) => {
        const isValid = validateSchema(
            schema.EncryptionEnvelopeSchema,
            envelop,
        );

        if (!isValid) {
            throw Error('Invalid message');
        }

        await redis.zAdd(
            RedisPrefix.Conversation + envelop.metadata.signature,
            {
                score: createdAt,
                value: stringify(envelop),
            },
        );
    };
}
