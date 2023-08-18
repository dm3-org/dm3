import {
    NotificationChannel,
    NotifificationChannelType,
    schema,
} from 'dm3-lib-delivery';
import { Redis, RedisPrefix } from '../getDatabase';
import { validateSchema } from 'dm3-lib-shared/dist.backend';
import { getIdEnsName } from '../getIdEnsName';
import { stringify } from 'dm3-lib-shared';

export function addUsersNotificationChannel(redis: Redis) {
    return async (ensName: string, channel: NotificationChannel) => {
        //Firstly we check if the input matches the general NotificationChannel schema
        const isValid = validateSchema(schema.NotifcationChannel, channel);

        if (!isValid) {
            throw Error('Invalid NotificationChannel');
        }
        //Secondly we check if the type specific config matches
        switch (channel.type) {
            case NotifificationChannelType.EMAIL: {
                const isValidConfig = validateSchema(
                    {
                        ...schema.EmailNotificationUserConfig,
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
        // Get previousy created notification Channels
        const existingNotificationChannelsJson = await redis.get(
            RedisPrefix.NotifcationChannel +
                (await getIdEnsName(redis)(ensName)),
        );

        //Parse Json. When no existing challes have benn returned from redis we initialze the struct as an empty array
        const existingNotificationChannels = existingNotificationChannelsJson
            ? JSON.parse(existingNotificationChannelsJson)
            : [];

        //Add the new channe to the already existing ones
        const newNotificationChannels = [
            ...existingNotificationChannels,
            channel,
        ];

        await redis.set(
            RedisPrefix.NotifcationChannel +
                (await getIdEnsName(redis)(ensName)),
            stringify(newNotificationChannels),
        );
    };
}
