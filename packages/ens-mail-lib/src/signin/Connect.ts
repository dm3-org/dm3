import { ethers } from 'ethers';
import { GetProfileRegistryEntry } from '..';
import { checkProfileRegistryEntry } from '../account/Account';
import { RequestAccounts } from '../external-apis/InjectedWeb3API';
import { ConnectionState } from '../web3-provider/Web3Provider';

export async function connectAccount(
    provider: ethers.providers.JsonRpcProvider,
    requestAccounts: RequestAccounts,
    getProfileRegistryEntry: GetProfileRegistryEntry,
): Promise<{
    account?: string;
    connectionState: ConnectionState;
    existingAccount: boolean;
}> {
    try {
        const account = await requestAccounts(provider);
        const profile = await getProfileRegistryEntry(provider, account);
        if (profile && !checkProfileRegistryEntry(profile, account)) {
            throw Error('Profile signature is invalid');
        }
        return {
            account,
            existingAccount: profile?.profileRegistryEntry.publicKeys
                ? true
                : false,
            connectionState: ConnectionState.CollectingSignInData,
        };
    } catch (e) {
        console.error(e);
        return {
            existingAccount: false,
            connectionState: ConnectionState.AccountConnectionRejected,
        };
    }
}
