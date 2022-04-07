import { ethers } from 'ethers';
import { ProfileRegistryEntry } from '../account/Account';
import { ConnectionState } from '../web3-provider/Web3Provider';

export async function connectAccount(
    provider: ethers.providers.JsonRpcProvider,
    requestAccounts: (
        provider: ethers.providers.JsonRpcProvider,
    ) => Promise<string>,
    getProfileRegistryEntry: (
        contact: string,
    ) => Promise<
        | { profileRegistryEntry: ProfileRegistryEntry; signature: string }
        | undefined
    >,
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
