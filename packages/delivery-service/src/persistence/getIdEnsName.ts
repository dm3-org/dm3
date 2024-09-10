import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { Redis } from './getDatabase';

//Todo replace db function get Db name
export function getIdEnsName(redis: Redis) {
    return (ensName: string) => Promise.resolve(normalizeEnsName(ensName));
}
