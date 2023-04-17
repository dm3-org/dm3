import * as Lib from 'dm3-lib/dist.backend';
import { Redis, RedisPrefix } from '../getDatabase';

export function createMessage(redis: Redis) {
    return async (
        conversationId: string,
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

        await redis.zAdd(RedisPrefix.Conversation + conversationId, {
            score: createdAt,
            value: Lib.stringify(envelop),
        });

        /**
         * add a redis set key = envelop.metadata.deliveryInformation.to and value = conversationId
         */

        await redis.zAdd(
            RedisPrefix.IncomingConversations +
                envelop.metadata.deliveryInformation.to,
            {
                score: createdAt,
                value: conversationId,
            },
        );
    };
}
