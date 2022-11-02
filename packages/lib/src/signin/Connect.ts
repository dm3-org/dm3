import { ethers } from 'ethers';
import { GetUserProfile } from '..';
import { checkUserProfile, SignedUserProfile } from '../account/Account';
import { RequestAccounts } from '../external-apis/InjectedWeb3API';
import { Connection, ConnectionState } from '../web3-provider/Web3Provider';

export async function connectAccount(
    connection: Connection,
    requestAccounts: RequestAccounts,
    getUserProfile: GetUserProfile,
    preSetAccount: string | undefined,
): Promise<{
    account?: string;
    connectionState: ConnectionState;
    existingAccount: boolean;
    profile?: SignedUserProfile;
}> {
    if (!connection.provider) {
        throw Error('No Provider');
    }

    try {
        const account =
            preSetAccount ?? (await requestAccounts(connection.provider));
        const profile = await getUserProfile(
            connection,
            account,
            connection.defaultServiceUrl + '/profile/' + account,
        );
        if (profile && !checkUserProfile(profile, account)) {
            throw Error('Profile signature is invalid');
        }
        //Todo is this the right way to do it

        return {
            account,
            existingAccount: profile !== undefined,
            connectionState: ConnectionState.SignInReady,
            profile,
        };
    } catch (e) {
        console.error(e);
        return {
            existingAccount: false,
            connectionState: ConnectionState.ConnectionRejected,
        };
    }
}
