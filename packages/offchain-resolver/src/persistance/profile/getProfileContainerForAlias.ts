import { ethers } from 'ethers';

import { PrismaClient } from '@prisma/client';
import {
    SignedUserProfile,
    UserProfile,
    normalizeEnsName,
} from 'dm3-lib-profile/dist.backend';
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
            return null;
        } else {
            const profileContainer = await db.profileContainer.findUnique({
                where: { id: aliasContainer.profileContainerId },
            });

            return profileContainer && profileContainer.profile
                ? {
                      ...profileContainer,
                      profile: JSON.parse(
                          profileContainer.profile.toString(),
                      ) as SignedUserProfile,
                  }
                : null;
        }
    };
}
