import { NotificationChannel } from '@dm3-org/dm3-lib-shared';
import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '@dm3-org/dm3-lib-server-side';

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
