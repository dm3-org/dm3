import { Redis, RedisPrefix } from './getDatabase';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';

export function getIdEnsName(redis: Redis) {
    const resolveAlias = async (ensName: string): Promise<string> => {
        const lowerEnsName = normalizeEnsName(
            (await redis.get(
                RedisPrefix.Session + 'alias:' + normalizeEnsName(ensName),
            )) ?? ensName,
        );

        return lowerEnsName === ensName ? ensName : resolveAlias(lowerEnsName);
    };
    return resolveAlias;
}

export function getAliasChain(redis: Redis) {
    const resolveAlias = async (
        ensName: string,
        chain: string[] = [],
    ): Promise<string[]> => {
        const lowerEnsName = normalizeEnsName(
            (await redis.get(
                RedisPrefix.Session + 'alias:' + normalizeEnsName(ensName),
            )) ?? ensName,
        );

        return lowerEnsName === ensName
            ? [...chain, ensName]
            : resolveAlias(lowerEnsName, [...chain, ensName]);
    };
    return (ensName: string) => resolveAlias(ensName, []);
}
