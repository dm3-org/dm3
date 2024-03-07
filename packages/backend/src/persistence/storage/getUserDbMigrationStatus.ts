import { Redis, RedisPrefix } from '../getDatabase';
import { getIdEnsName } from '../getIdEnsName';

export const getUserDbMigrationStatus =
    (redis: Redis) => async (ensName: string) => {
        const idEnsName = await getIdEnsName(redis)(ensName);
        const migrated = await redis.get(
            `${RedisPrefix.UserStorageMigrated}${idEnsName}`,
        );
        return migrated === 'true';
    };
