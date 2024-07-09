import { stringify } from '@dm3-org/dm3-lib-shared';
import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '@dm3-org/dm3-lib-server-side';
import { IOtp } from '@dm3-org/dm3-lib-delivery';
import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';

export const SEPARATION_OPERATOR = '=';

export function setOtp(redis: Redis) {
    return async (
        ensName: string,
        otp: string,
        channelType: NotificationChannelType,
        generatedAt: Date,
    ) => {
        // new otp object
        const otpRecord: IOtp = {
            otp: otp,
            type: channelType,
            generatedAt: generatedAt,
        };

        // Store the new otp back into Redis
        await redis.set(
            RedisPrefix.Otp.concat(
                await getIdEnsName(redis)(ensName),
                SEPARATION_OPERATOR,
                channelType,
            ),
            stringify(otpRecord),
        );
    };
}
