import { getIdEnsName, Redis } from '@dm3-org/dm3-lib-server-side';
import { RedisPrefix } from '../getDatabase';

//flag to indicate that the user storage has been migrated to the new postgres based storage
export const setUserDbMigrated = (redis: Redis) => async (ensName: string) => {
    const idEnsName = await getIdEnsName(redis)(ensName);
    await redis.set(`${RedisPrefix.UserStorageMigrated}${idEnsName}`, 'true');
};
