import axios from 'axios';
import { Account, SignedUserProfile } from 'dm3-lib-profile';

function checkAccount(account: Account | undefined): Required<Account> {
    if (!account) {
        throw Error('No account');
    }
    if (!account.profile) {
        throw Error('Account has no profile.');
    }
    return account as Required<Account>;
}
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
