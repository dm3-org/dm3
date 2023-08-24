import {
    NotificationChannel,
    NotificationChannelType,
    schema,
} from 'dm3-lib-delivery';
import { Redis, RedisPrefix } from '../getDatabase';
import { validateSchema } from 'dm3-lib-shared/dist.backend';
import { getIdEnsName } from '../getIdEnsName';
import { stringify } from 'dm3-lib-shared';

export function addUsersNotificationChannel(redis: Redis) {
    return async (ensName: string, channel: NotificationChannel) => {
        // Check if the input matches the general NotificationChannel schema
        const isValid = validateSchema(schema.NotifcationChannel, channel);

        if (!isValid) {
            throw Error('Invalid NotificationChannel');
        }

        // Check if the type-specific config matches based on the channel type
        switch (channel.type) {
            case NotificationChannelType.EMAIL: {
                const isValidConfig = validateSchema(
                    {
                        ...schema.EmailNotificationUserConfig,
                        // Adding validation for the recipientAddress field
                        definitions: {
                            ...schema.EmailNotificationUserConfig.definitions,
                            EmailNotificationUserConfig: {
                                ...schema.EmailNotificationUserConfig
                                    .definitions.EmailNotificationUserConfig,
                                properties: {
                                    ...schema.EmailNotificationUserConfig
                                        .definitions.EmailNotificationUserConfig
                                        .properties,
                                    recipientAddress: {
                                        type: 'string',
                                        format: 'email',
                                    },
                                },
                            },
                        },
                    },
                    channel.config,
                );

                if (!isValidConfig) {
                    throw Error('Invalid Email config');
                }
            }
        }

        // Get previously created notification channels
        const existingNotificationChannelsJson = await redis.get(
            RedisPrefix.NotificationChannel +
                (await getIdEnsName(redis)(ensName)),
        );

        // Parse JSON. Initialize the array if no existing channels were returned
        const existingNotificationChannels = existingNotificationChannelsJson
            ? JSON.parse(existingNotificationChannelsJson)
            : [];

        // Add the new channel to the existing ones
        const newNotificationChannels = [
            ...existingNotificationChannels,
            channel,
        ];

        // Store the updated channels back into Redis
        await redis.set(
            RedisPrefix.NotificationChannel +
                (await getIdEnsName(redis)(ensName)),
            stringify(newNotificationChannels),
        );
    };
}
