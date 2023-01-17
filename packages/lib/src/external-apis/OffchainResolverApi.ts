import axios from 'axios';
import { Account, SignedUserProfile } from '../account/Account';

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
    const { address } = checkAccount(account);

    const url = `${offchainResolverUrl}/name`;
    const data = {
        signedUserProfile,
        name,
        address,
    };

    const { status } = await axios.post(url, data);
    return status === 200;
}

export async function claimAddress(
    account: Account,
    offchainResolverUrl: string,
    signedUserProfile: SignedUserProfile,
) {
    const { address } = checkAccount(account);

    const url = `${offchainResolverUrl}/address`;
    const data = {
        signedUserProfile,
        address,
    };

    const { status } = await axios.post(url, data);
    return status === 200;
}
