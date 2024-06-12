import { PrismaClient } from '@prisma/client';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';

/**
 *
 * @param {Redis} redis - Redis client
 * @param {string} alias - ENS alias name
 * @returns {Promise<boolean>} - A promise that resolves to true if the profile is removed, false otherwise
 */
export function removeAlias(db: PrismaClient) {
    return async (dm3Name: string) => {
        try {
            const normalizedDm3Name = normalizeEnsName(dm3Name);

            await db.alias.delete({
                where: {
                    alias: normalizedDm3Name,
                },
            });
            console.debug('removed alias', normalizedDm3Name);
            return true;
        } catch (e) {
            console.error(`unable to remove ${dm3Name}`);
            console.error(e);
            return false;
        }
    };
}
