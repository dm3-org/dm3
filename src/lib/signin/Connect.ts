import { ethers } from 'ethers';
import { check } from 'prettier';
import {
    checkProfileRegistryEntry,
    ProfileRegistryEntry,
} from '../account/Account';
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
        const profile = await getProfileRegistryEntry(account);
        if (
            profile &&
            !checkProfileRegistryEntry(
                profile?.profileRegistryEntry,
                profile?.signature,
                account,
            )
        ) {
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
        return {
            existingAccount: false,
            connectionState: ConnectionState.AccountConnectionRejected,
        };
    }
}
