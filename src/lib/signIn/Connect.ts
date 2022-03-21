import { ethers } from 'ethers';
import { PublicKeys } from '../account/Account';
import { ConnectionState } from '../web3-provider/Web3Provider';

export async function connectAccount(
    provider: ethers.providers.JsonRpcProvider,
    requestAccounts: (
        provider: ethers.providers.JsonRpcProvider,
    ) => Promise<string>,
    getPublicKeys: (contact: string) => Promise<PublicKeys | undefined>,
): Promise<{
    account?: string;
    connectionState: ConnectionState;
    existingAccount: boolean;
}> {
    try {
        const account = await requestAccounts(provider);

        return {
            account,
            existingAccount: (await getPublicKeys(account))?.publicKey
                ? true
                : false,
            connectionState: ConnectionState.SignInReady,
        };
    } catch (e) {
        return {
            existingAccount: false,
            connectionState: ConnectionState.AccountConnectionRejected,
        };
    }
}
