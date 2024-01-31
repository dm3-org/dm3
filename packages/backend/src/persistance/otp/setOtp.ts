import { stringify } from '@dm3-org/dm3-lib-shared';
import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../getIdEnsName';
import { IOtp, NotificationChannelType } from '@dm3-org/dm3-lib-delivery';

export function setOtp(redis: Redis) {
    return async (
        ensName: string,
        otp: string,
        channelType: NotificationChannelType,
        generatedAt: Date,
    ) => {
        // Get existing OTP records from Redis
        const existingOtp = await redis.get(
            RedisPrefix.Otp + (await getIdEnsName(redis)(ensName)),
        );

        // Parse JSON. Initialize the array if no existing records were returned
        const existingOtpJson: IOtp[] = existingOtp
            ? JSON.parse(existingOtp)
            : [];

        // filter out otp if already exists
        const otherExistingOtps = existingOtpJson.filter(
            (data) => data.type !== channelType,
        );

        // new otp object
        const otpRecord: IOtp = {
            otp: otp,
            type: channelType,
            generatedAt: generatedAt,
        };

        // Add the new otp record to the existing ones
        const newOtpRecord = [...otherExistingOtps, otpRecord];

        // Store the updated otps back into Redis
        await redis.set(
            RedisPrefix.Otp + (await getIdEnsName(redis)(ensName)),
            stringify(newOtpRecord),
        );
    };
}
