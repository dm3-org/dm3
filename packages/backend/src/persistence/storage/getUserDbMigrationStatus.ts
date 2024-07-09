import { Redis, getIdEnsName } from '@dm3-org/dm3-lib-server-side';
import { RedisPrefix } from '../getDatabase';

export const getUserDbMigrationStatus =
    (redis: Redis) => async (ensName: string) => {
        const idEnsName = await getIdEnsName(redis)(ensName);
        const migrated = await redis.get(
            `${RedisPrefix.UserStorageMigrated}${idEnsName}`,
        );
        return migrated === 'true';
    };
