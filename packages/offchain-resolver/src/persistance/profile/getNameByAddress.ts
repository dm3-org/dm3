import { ADDRESS_TO_NAME_KEY } from '.';
import * as Lib from 'dm3-lib/dist.backend';
import { Redis } from '../getDatabase';

export function getNameByAddress(redis: Redis) {
    return async (address: string) => {
        const isMember = await redis.exists(
            ADDRESS_TO_NAME_KEY +
                Lib.shared.ethersHelper.formatAddress(address),
        );
        if (!isMember) {
            return null;
        }

        return await redis.get(
            ADDRESS_TO_NAME_KEY +
                Lib.shared.ethersHelper.formatAddress(address),
        );
    };
}
