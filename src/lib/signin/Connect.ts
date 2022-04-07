import { ethers } from 'ethers';
import { ProfileRegistryEntry } from '../account/Account';
import { GetProfileRegistryEntry } from '../external-apis/BackendAPI';
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
        return {
            account,
            existingAccount: (await getProfileRegistryEntry(account))
                ?.profileRegistryEntry.publicKeys
                ? true
                : false,
            connectionState: ConnectionState.CollectingSignInData,
        };
    } catch (e) {
        return {
            existingAccount: false,
            connectionState: ConnectionState.AccountConnectionRejected,
        };
    }
}
