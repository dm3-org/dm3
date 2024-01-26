import {
    NotificationChannel,
    NotificationUserConfig,
    schema,
} from '@dm3-org/dm3-lib-delivery';
import { Redis, RedisPrefix } from '../getDatabase';
import { validateSchema } from '@dm3-org/dm3-lib-shared';
import { getIdEnsName } from '../getIdEnsName';
import { stringify } from '@dm3-org/dm3-lib-shared';

export function addUsersNotificationChannel(redis: Redis) {
    return async (ensName: string, channel: NotificationChannel) => {
        // Check if the input matches the general NotificationChannel schema
        const isValid = validateSchema(schema.NotificationChannel, channel);

        if (!isValid) {
            throw Error('Invalid NotificationChannel');
        }

        // Get previously created notification channels
        const existingNotificationChannelsJson = await redis.get(
            RedisPrefix.NotificationChannel +
                (await getIdEnsName(redis)(ensName)),
        );

        // Parse JSON. Initialize the array if no existing channels were returned
        const existingNotificationChannels: NotificationChannel[] =
            existingNotificationChannelsJson
                ? JSON.parse(existingNotificationChannelsJson)
                : [];

        // filter out channel if already exists
        const otherExistingChannels = existingNotificationChannels.filter(
            (data) => data.type !== channel.type,
        );

        // new notification config
        const config: NotificationUserConfig = {
            recipientValue: channel.config.recipientValue,
            isEnabled: true,
            isVerified: false,
        };

        channel.config = config;

        // Add the new channel to the existing ones
        const newNotificationChannels = [...otherExistingChannels, channel];

        // Store the updated channels back into Redis
        await redis.set(
            RedisPrefix.NotificationChannel +
                (await getIdEnsName(redis)(ensName)),
            stringify(newNotificationChannels),
        );
    };
}
