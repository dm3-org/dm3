import {
    NotificationChannelType,
    NotificationChannel,
} from '@dm3-org/dm3-lib-shared';
import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../getIdEnsName';
import { stringify } from '@dm3-org/dm3-lib-shared';

// removes notification channel from the DB for speicifc ens name
export function removeNotificationChannel(redis: Redis) {
    return async (
        ensName: string,
        notificationChannelType: NotificationChannelType,
    ) => {
        // Fetch notification channels from redis
        const notificationChannelsJson = await redis.get(
            RedisPrefix.NotificationChannel +
                (await getIdEnsName(redis)(ensName)),
        );

        // return if no channel is found
        if (!notificationChannelsJson) {
            return;
        }

        // Parse JSON existing channels
        const notificationChannels: NotificationChannel[] = JSON.parse(
            notificationChannelsJson,
        );

        // filter out the channel
        const filteredChannels = notificationChannels.filter(
            (data) => data.type !== notificationChannelType,
        );

        // Store the updated channels back into Redis
        await redis.set(
            RedisPrefix.NotificationChannel +
                (await getIdEnsName(redis)(ensName)),
            stringify(filteredChannels),
        );
    };
}
