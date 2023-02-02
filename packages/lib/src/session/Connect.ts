import { ethers } from 'ethers';
import { GlobalConf } from '..';
import { GetUserProfile } from '../account';
import { checkUserProfile, SignedUserProfile } from '../account/Account';
import { getNameForAddress } from '../external-apis';
import { RequestAccounts } from '../external-apis/InjectedWeb3API';
import { log } from '../shared/log';
import { Connection, ConnectionState } from '../web3-provider/Web3Provider';

async function findEnsNameToUse(
    provider: ethers.providers.JsonRpcProvider,
    address: string,
) {
    return (
        (await provider.lookupAddress(address)) ??
        (await getNameForAddress(address))
    );
}

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
    ethAddress?: string;
}> {
    if (!connection.provider) {
        throw Error('No Provider');
    }

    try {
        let account: string | undefined;

        const address =
            preSetAccount ?? (await requestAccounts(connection.provider));

        const ensName = await findEnsNameToUse(connection.provider, address);

        let profile: SignedUserProfile | undefined;

        if (ensName) {
            profile = await getUserProfile(connection, ensName);
            if (profile) {
                account = ensName;
            }
        }

        if (!profile) {
            try {
                profile = await getUserProfile(
                    connection,
                    address + GlobalConf.ADDR_ENS_SUBDOMAIN(),
                );

                if (profile) {
                    account = address + GlobalConf.ADDR_ENS_SUBDOMAIN();
                }
            } catch (e) {
                log(`Couldn't get address ENS name`);
            }
        }

        if (
            profile &&
            !(await checkUserProfile(connection.provider, profile, address))
        ) {
            throw Error('Profile signature is invalid');
        }

        return {
            account,
            ethAddress: address,
            existingAccount: profile !== undefined,
            connectionState: ConnectionState.SignInReady,
            profile,
        };
    } catch (e) {
        log((e as Error).message);
        return {
            existingAccount: false,
            connectionState: ConnectionState.ConnectionRejected,
        };
    }
}
