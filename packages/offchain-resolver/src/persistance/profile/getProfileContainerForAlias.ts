import { ethers } from 'ethers';

import { PrismaClient } from '@prisma/client';
import {
    SignedUserProfile,
    UserProfile,
    normalizeEnsName,
} from 'dm3-lib-profile';
import { ProfileContainer } from './getProfileContainer';

/**
 *
 * @param {db} PrismaClient
 * @param {alias} ENS alias name
 * @returns {Promise<boolean>} - profile container
 */
export function getProfileContainerForAlias(db: PrismaClient) {
    return async (alias: string): Promise<ProfileContainer | null> => {
        const aliasContainer = await db.alias.findUnique({
            where: { alias: normalizeEnsName(alias) },
        });
        if (!aliasContainer) {
<<<<<<< HEAD
=======
            global.logger.debug({
                message: 'getProfileContainerForAlias',
                alias: normalizeEnsName(alias),
            });
>>>>>>> 4bdf0d7f5a0bb95b948c66e6c6ba098ec114ddec
            return null;
        } else {
            const profileContainer = await db.profileContainer.findUnique({
                where: { id: aliasContainer.profileContainerId },
            });

<<<<<<< HEAD
            return profileContainer && profileContainer.profile
                ? {
                      ...profileContainer,
                      profile: JSON.parse(
                          profileContainer.profile.toString(),
                      ) as SignedUserProfile,
                  }
                : null;
=======
            const profileContainerResult =
                profileContainer && profileContainer.profile
                    ? {
                          ...profileContainer,
                          profile: JSON.parse(
                              profileContainer.profile.toString(),
                          ) as SignedUserProfile,
                      }
                    : null;

            global.logger.debug({
                message: 'getProfileContainerForAlias',
                id: aliasContainer.profileContainerId,
                profileContainerResult,
            });

            return profileContainerResult;
>>>>>>> 4bdf0d7f5a0bb95b948c66e6c6ba098ec114ddec
        }
    };
}
