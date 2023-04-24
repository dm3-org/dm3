import { NAME_TO_ADDRESS_KEY } from '.';
import { Redis } from '../getDatabase';

export function getAddressByName(redis: Redis) {
    return async (nameHash: string) => {
        const isMember = await redis.exists(NAME_TO_ADDRESS_KEY + nameHash);
        if (!isMember) {
            return null;
        }

        return await redis.get(NAME_TO_ADDRESS_KEY + nameHash);
    };
}
