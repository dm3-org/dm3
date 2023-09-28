import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { normalizeEnsName } from 'dm3-lib-profile';

/**
 *
 * @param {db} PrismaClient
 * @param {string} name - ENS name
 * @param {alias} ENS alias name
 * @returns {Promise<boolean>} - A promise that resolves to true if the alias is set successfully, false otherwise
 */
export function setLink(db: PrismaClient) {
    return async (name: string, link: string) => {
        const nameHash = ethers.utils.namehash(name);

        try {
            await db.profileContainer.update({
                where: { nameHash },
                data: {
                    links: {
                        push: link,
                    },
                },
            });

            global.logger.debug({
                message: 'setLink',
                link,
            });

            return true;
        } catch (e) {
            return false;
        }
    };
}
