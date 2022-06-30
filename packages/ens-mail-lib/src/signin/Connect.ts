import { ethers } from 'ethers';
import { GetProfileRegistryEntry } from '..';
import {
    checkProfileRegistryEntry,
    SignedProfileRegistryEntry,
} from '../account/Account';
import { RequestAccounts } from '../external-apis/InjectedWeb3API';
import { Connection, ConnectionState } from '../web3-provider/Web3Provider';

export async function connectAccount(
    connection: Connection,
    requestAccounts: RequestAccounts,
    getProfileRegistryEntry: GetProfileRegistryEntry,
): Promise<{
    account?: string;
    connectionState: ConnectionState;
    existingAccount: boolean;
    profile?: SignedProfileRegistryEntry;
}> {
    if (!connection.provider) {
        throw Error('No Provider');
    }

    try {
        const account = await requestAccounts(connection.provider);
        const profile = await getProfileRegistryEntry(
            connection,
            account,
            connection.defaultServiceUrl + '/profile/' + account,
        );
        if (profile && !checkProfileRegistryEntry(profile, account)) {
            throw Error('Profile signature is invalid');
        }
        return {
            account,
            existingAccount: profile?.profileRegistryEntry.publicKeys
                ? true
                : false,
            connectionState: ConnectionState.CollectingSignInData,
            profile,
        };
    } catch (e) {
        console.error(e);
        return {
            existingAccount: false,
            connectionState: ConnectionState.AccountConnectionRejected,
        };
    }
}
