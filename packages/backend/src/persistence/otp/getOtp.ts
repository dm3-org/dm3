import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../getIdEnsName';
import { IOtp } from '@dm3-org/dm3-lib-delivery';
import { SEPARATION_OPERATOR } from './setOtp';
import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';

export function getOtp(redis: Redis) {
    return async (
        ensName: string,
        channelType: NotificationChannelType,
    ): Promise<IOtp | null> => {
        // Fetch the otp from Redis
        const channelOtp = await redis.get(
            RedisPrefix.Otp.concat(
                await getIdEnsName(redis)(ensName),
                SEPARATION_OPERATOR,
                channelType,
            ),
        );

        return channelOtp ? JSON.parse(channelOtp) : null;
    };
}
