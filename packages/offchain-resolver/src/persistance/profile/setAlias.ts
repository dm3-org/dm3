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
export function setAlias(db: PrismaClient) {
    return async (name: string, alias: string) => {
        const nameHash = ethers.utils.namehash(name);

        try {
            await db.profileContainer.update({
                where: { nameHash },
                data: {
                    aliases: {
                        create: [
                            { id: uuidv4(), alias: normalizeEnsName(alias) },
                        ],
                    },
                },
            });

<<<<<<< HEAD
=======
            global.logger.debug({
                message: 'setAlias',
                id: uuidv4(),
                alias: normalizeEnsName(alias),
            });

>>>>>>> 4bdf0d7f5a0bb95b948c66e6c6ba098ec114ddec
            return true;
        } catch (e) {
            return false;
        }
    };
}
