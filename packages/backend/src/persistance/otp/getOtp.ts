import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../getIdEnsName';
import { IOtp, NotificationChannelType } from '@dm3-org/dm3-lib-delivery';

export function getOtp(redis: Redis) {
    return async (
        ensName: string,
        channelType: NotificationChannelType,
    ): Promise<IOtp | null> => {
        // Fetch all the otp from Redis
        const channelOtps = await redis.get(
            RedisPrefix.Otp + (await getIdEnsName(redis)(ensName)),
        );

        if (channelOtps) {
            const parsedOtps: IOtp[] = JSON.parse(channelOtps);

            // filter the record with specific channel type
            const filteredOtp = parsedOtps.filter(
                (data) => data.type === channelType,
            );

            // return if found else null
            return filteredOtp.length ? filteredOtp[0] : null;
        } else {
            return null;
        }
    };
}
