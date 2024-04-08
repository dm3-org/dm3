import { NotificationError } from '@dm3-org/dm3-lib-delivery';
import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../getIdEnsName';
import { stringify } from '@dm3-org/dm3-lib-shared';
import { NotificationChannelType, NotificationChannel } from '@dm3-org/dm3-lib-shared';

export function setNotificationChannelAsVerified(redis: Redis) {
    return async (
        ensName: string,
        notificationChannelType: NotificationChannelType,
    ) => {
        // Fetch notification channels from redis
        const notificationChannelsJson = await redis.get(
            RedisPrefix.NotificationChannel +
                (await getIdEnsName(redis)(ensName)),
        );

        // throw error if no channel is found
        if (!notificationChannelsJson) {
            throw new NotificationError(
                `Notification channel ${notificationChannelType} is not configured`,
            );
        }

        // Parse JSON existing channels
        const notificationChannels: NotificationChannel[] = JSON.parse(
            notificationChannelsJson,
        );

        // find out channel
        const channelIndex = notificationChannels.findIndex(
            (data) => data.type === notificationChannelType,
        );

        // throw error if channel to verify is not found or is not enabled
        if (
            channelIndex < 0 ||
            !notificationChannels[channelIndex].config.isEnabled
        ) {
            throw new NotificationError(
                `Notification channel ${notificationChannelType} is not enabled`,
            );
        }

        // set verified true
        notificationChannels[channelIndex].config.isVerified = true;

        // Store the updated channels back into Redis
        await redis.set(
            RedisPrefix.NotificationChannel +
                (await getIdEnsName(redis)(ensName)),
            stringify(notificationChannels),
        );
    };
}
