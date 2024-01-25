import { sign } from '@dm3-org/dm3-lib-crypto';
import { SignedUserProfile, formatAddress } from '@dm3-org/dm3-lib-profile';
import axios from 'axios';

export async function claimSubdomain(
    alias: string,
    offchainResolverUrl: string,
    name: string,
    privateKey: string,
): Promise<boolean> {
    const url = `${offchainResolverUrl}/profile/name`;
    const data = {
        alias,
        name,
        signature: await sign(privateKey, 'alias: ' + alias),
    };

    const { status } = await axios.post(url, data);
    return status === 200;
}

/**
 * removes a dm3.eth subdomain
 * @param alias the ENS alias
 * @param offchainResolverUrl The offchain resolver endpoint url
 * @param privateKey The owner private key
 */
export async function removeAlias(
    alias: string,
    offchainResolverUrl: string,
    privateKey: string,
): Promise<boolean> {
    const url = `${offchainResolverUrl}/profile/name`;
    const data = {
        name: alias,
        signature: await sign(privateKey, 'remove: ' + alias),
    };

    const { status } = await axios.post(url, data);
    return status === 200;
}

/**
 * claims an address based ENS subdomain name
 * @param address The ethereum address
 * @param offchainResolverUrl The offchain resolver endpoint url
 * @param signedUserProfile The signed dm3 user profile
 */
export async function claimAddress(
    address: string,
    offchainResolverUrl: string,
    signedUserProfile: SignedUserProfile,
) {
    const url = `${offchainResolverUrl}/profile/address`;
    const data = {
        signedUserProfile,
        address,
    };

    const { status } = await axios.post(url, data);
    return status === 200;
}

/**
 * returns the linked ENS name for an eth address
 * @param address The ethereum address
 * @param offchainResolverUrl The offchain resolver endpoint url
 */
export async function getNameForAddress(
    address: string,
    offchainResolverUrl: string,
): Promise<string | undefined> {
    const url = `${offchainResolverUrl}/profile/name/${formatAddress(address)}`;
    try {
        const { data } = await axios.get(url);
        return data.name;
    } catch (e) {
        return;
    }
}
export type GetNameForAddress = typeof getNameForAddress;
