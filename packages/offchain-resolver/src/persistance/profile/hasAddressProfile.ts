import { PrismaClient } from '@prisma/client';
import { ethersHelper } from 'dm3-lib-shared/dist.backend';

/**
 * Check if the given address has a profile
 * @param {Redis} redis - Redis client
 * @param {string} address - Ethereum address
 * @returns {Promise<boolean>} - A promise that resolves to true if the address has a profile, false otherwise
 */
export function hasAddressProfile(db: PrismaClient) {
    return async (address: string) => {
        return !!(await db.profileContainer.findUnique({
            where: {
                address: ethersHelper.formatAddress(address),
            },
        }));
    };
}
