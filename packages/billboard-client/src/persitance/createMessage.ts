import * as Lib from 'dm3-lib/dist.backend';
import { Redis, RedisPrefix } from './getDatabase';

export function createMessage(redis: Redis) {
    return async (
        envelop: Lib.messaging.EncryptionEnvelop,
        createdAt: number = new Date().getTime(),
    ) => {
        const isValid = Lib.validateSchema(
            Lib.messaging.schema.EncryptionEnvelopeSchema,
            envelop,
        );

        if (!isValid) {
            throw Error('Invalid message');
        }

        await redis.zAdd(
            RedisPrefix.Conversation + envelop.metadata.signature,
            {
                score: createdAt,
                value: Lib.stringify(envelop),
            },
        );
    };
}
