import { stringify } from '@dm3-org/dm3-lib-shared';
import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../getIdEnsName';
import { NotificationChannelType } from '@dm3-org/dm3-lib-delivery';

export const SEPARATION_OPERATOR = '=';

export function resetOtp(redis: Redis) {
    return async (ensName: string, channelType: NotificationChannelType) => {
        // reset the otp & store back into Redis
        await redis.set(
            RedisPrefix.Otp.concat(
                await getIdEnsName(redis)(ensName),
                SEPARATION_OPERATOR,
                channelType,
            ),
            stringify(null),
        );
    };
}
