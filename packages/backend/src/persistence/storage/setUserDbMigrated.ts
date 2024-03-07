import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../getIdEnsName';

//flag to indicate that the user storage has been migrated to the new postgres based storage
export const setUserDbMigrated = (redis: Redis) => async (ensName: string) => {
    const idEnsName = await getIdEnsName(redis)(ensName);
    await redis.set(`${RedisPrefix.UserStorageMigrated}${idEnsName}`, 'true');
};
