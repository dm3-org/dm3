import { EncryptionEnvelop, schema } from '@dm3-org/dm3-lib-messaging';
import { stringify, validateSchema } from '@dm3-org/dm3-lib-shared';
import { Redis, RedisPrefix } from '../getDatabase';
export function createMessage(redis: Redis) {
    return async (
        receiverAddress: string,
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

        console.debug('store incoming conversation for', receiverAddress);

        //We've to keep track of every incoming conversations for the address
        await redis.zAdd(RedisPrefix.IncomingConversations + receiverAddress, {
            score: createdAt,
            value: conversationId,
        });
    };
}
