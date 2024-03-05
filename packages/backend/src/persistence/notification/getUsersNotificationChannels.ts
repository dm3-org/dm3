import { NotificationChannel } from '@dm3-org/dm3-lib-delivery';
import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../getIdEnsName';

export function getUsersNotificationChannels(redis: Redis) {
    return async (ensName: string): Promise<NotificationChannel[]> => {
        const notificationChannels = await redis.get(
            RedisPrefix.NotificationChannel +
                (await getIdEnsName(redis)(ensName)),
        );

        return notificationChannels
            ? (JSON.parse(notificationChannels) as NotificationChannel[])
            : [];
    };
}
