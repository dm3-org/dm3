import { ADDRESS_TO_NAME_KEY } from '.';
import { ethersHelper } from 'dm3-lib-shared/dist.backend';
import { Redis } from '../getDatabase';

export function getNameByAddress(redis: Redis) {
    return async (address: string) => {
        const isMember = await redis.exists(
            ADDRESS_TO_NAME_KEY + ethersHelper.formatAddress(address),
        );
        if (!isMember) {
            return null;
        }

        return await redis.get(
            ADDRESS_TO_NAME_KEY + ethersHelper.formatAddress(address),
        );
    };
}
