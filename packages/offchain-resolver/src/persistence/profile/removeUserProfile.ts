import { PrismaClient } from '@prisma/client';
import { getProfileContainer } from './getProfileContainer';

/**
 *
 * @param {Redis} redis - Redis client
 * @param {string} name - ENS name
 * @returns {Promise<boolean>} - A promise that resolves to true if the profile is removed, false otherwise
 */
export function removeUserProfile(db: PrismaClient) {
    return async (name: string) => {
        try {
            const profileContainer = await getProfileContainer(db)(name);

            if (!profileContainer) {
                return false;
            }

            await db.alias.deleteMany({
                where: {
                    profileContainerId: profileContainer.id,
                },
            });

            await db.profileContainer.delete({
                where: {
                    nameHash: profileContainer.nameHash,
                },
            });

            console.debug({
                message: 'removeUserProfile',
                profileContainerId: profileContainer.id,
                nameHash: profileContainer.nameHash,
            });

            return true;
        } catch (e) {
            return false;
        }
    };
}
