import { Redis, RedisPrefix } from '../getDatabase';
import {
    schema,
    DeliveryInformation,
    EncryptionEnvelop,
} from 'dm3-lib-messaging/dist.backend';
import { validateSchema, stringify } from 'dm3-lib-shared/dist.backend';
export function createMessage(redis: Redis) {
    return async (
        conversationId: string,
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

        await redis.zAdd(RedisPrefix.Conversation + conversationId, {
            score: createdAt,
            value: stringify(envelop),
        });

        /**
         * add a redis set key = envelop.metadata.deliveryInformation.to and value = conversationId
         */
        /**
         * We can assume that the deliveryInformation is always encrypted because the
         * DS must've encrypted it before persisting the message to the database.
         *
         *
         *  In the future we have to refactor the DeliveryInformation Type
         *  to we can ensure that on compile time. https://github.com/corpus-io/dm3/issues/479
         */
        const encryptedDeliverInformation = envelop.metadata
            .deliveryInformation as DeliveryInformation;

        await redis.zAdd(
            RedisPrefix.IncomingConversations + encryptedDeliverInformation.to,
            {
                score: createdAt,
                value: conversationId,
            },
        );
    };
}
