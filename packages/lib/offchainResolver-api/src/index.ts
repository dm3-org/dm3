import axios from 'axios';
import { Account, SignedUserProfile, formatAddress } from 'dm3-lib-profile';

function checkAccount(account: Account | undefined): Required<Account> {
    if (!account) {
        throw Error('No account');
    }
    if (!account.profile) {
        throw Error('Account has no profile.');
    }
    return account as Required<Account>;
}

/**
 * claims a dm3.eth subdomain
 * @param account dm3 account
 * @param offchainResolverUrl The offchain resolver endpoint url
 * @param name The subdomain name
 * @param signedUserProfile The signed dm3 user profile
 */

export async function claimSubdomain(
    account: Account,
    offchainResolverUrl: string,
    name: string,
    signedUserProfile: SignedUserProfile,
): Promise<boolean> {
    const { ensName } = checkAccount(account);

    const url = `${offchainResolverUrl}/profile/name`;
    const data = {
        signedUserProfile,
        name,
        ensName,
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
    const url = `${offchainResolverUrl}/name/${formatAddress(address)}`;
    try {
        const { data } = await axios.get(url);
        return data.name;
    } catch (e) {
        return;
    }
}
export type GetNameForAddress = typeof getNameForAddress;
