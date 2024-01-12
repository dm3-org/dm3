import { PrismaClient } from '@prisma/client';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';

/**
 *
 * @param {Redis} redis - Redis client
 * @param {string} alias - ENS alias name
 * @returns {Promise<boolean>} - A promise that resolves to true if the profile is removed, false otherwise
 */
export function removeAlias(db: PrismaClient) {
    return async (alias: string) => {
        try {
            const normalizedAlias = normalizeEnsName(alias);

            await db.alias.delete({
                where: {
                    alias: normalizedAlias,
                },
            });

            global.logger.debug({
                message: 'removeAlias',

                alias: normalizedAlias,
            });

            return true;
        } catch (e) {
            return false;
        }
    };
}
