import {
    NotificationChannel,
    NotificationChannelType,
    NotificationError,
} from '@dm3-org/dm3-lib-delivery';
import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../getIdEnsName';
import { stringify } from '@dm3-org/dm3-lib-shared';

export function setNotificationChannelAsVerified(redis: Redis) {
    return async (
        ensName: string,
        notificationChannelType: NotificationChannelType,
    ) => {
        // Fetch notification channels from redis
        const existingNotificationChannelsJson = await redis.get(
            RedisPrefix.NotificationChannel +
                (await getIdEnsName(redis)(ensName)),
        );

        // throw error if no channel is found
        if (!existingNotificationChannelsJson) {
            throw new NotificationError(
                `Notification channel ${notificationChannelType} is not configured`,
            );
        }

        // Parse JSON existing channels
        const existingNotificationChannels: NotificationChannel[] = JSON.parse(
            existingNotificationChannelsJson,
        );

        // filter out channel
        const channelToVerify = existingNotificationChannels.filter(
            (data) => data.type === notificationChannelType,
        );

        // throw error if channel to verify is not found
        if (!channelToVerify.length) {
            throw new NotificationError(
                `Notification channel ${notificationChannelType} is not configured`,
            );
        }

        // throw error if channel is not enabled
        if (!channelToVerify[0].config.isEnabled) {
            throw new NotificationError(
                `Notification channel ${notificationChannelType} is not enabled`,
            );
        }

        // set verified true
        channelToVerify[0].config.isVerified = true;

        // Store the updated channels back into Redis
        await redis.set(
            RedisPrefix.NotificationChannel +
                (await getIdEnsName(redis)(ensName)),
            stringify(existingNotificationChannels),
        );
    };
}
