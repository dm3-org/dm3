import axios from 'axios';
import * as Lib from 'dm3-lib';

export function getAliasForAddress(address: string) {
    return address + Lib.GlobalConf.ADDR_ENS_SUBDOMAIN();
}

export async function connectEthAccount(
    connection: Lib.Connection,
    requestAccounts: Lib.shared.ethersHelper.RequestAccounts,
    preSetAccount: string | undefined,
): Promise<{
    account?: string;
    connectionState: Lib.web3provider.ConnectionState;
    existingAccount: boolean;
    profile?: Lib.account.SignedUserProfile;
    ethAddress?: string;
}> {
    if (!connection.provider) {
        throw Error('No Provider');
    }

    try {
        const address =
            preSetAccount ?? (await requestAccounts(connection.provider));

        const ensName = await connection.provider.lookupAddress(address);
        return ensName
            ? await connectOnchainAccount(connection, ensName, address)
            : await connectOffchainAccount(connection, address);
    } catch (e) {
        Lib.shared.log((e as Error).message);
        return {
            existingAccount: false,
            connectionState:
                Lib.web3provider.ConnectionState.ConnectionRejected,
        };
    }
}

async function connectOnchainAccount(
    connection: Lib.Connection,
    ensName: string,
    address: string,
) {
    const onChainProfile = await Lib.account.getUserProfile(
        connection,
        ensName,
    );

    /**
     * If it turns out there is no on chain profile available
     * we proceed trying to connect the account with an offchain profile
     */
    if (!onChainProfile) {
        return await connectOffchainAccount(connection, address);
    }
    /**
     * We've to check wether the profile published on chain belongs to the address we're trying to connectÌ
     */
    const isProfileValid = await Lib.account.checkUserProfile(
        connection.provider!,
        onChainProfile,
        address,
    );

    if (!isProfileValid) {
        throw Error('Profile signature is invalid');
    }
    /**
     * We have to check wether this ensName is already registered on the delivery service
     * Wether the account exists or not decides wether we have to call signIn or reAuth later
     */
    const existingAccount = await profileExistsOnDeliveryService(
        connection,
        ensName,
    );
    return {
        account: ensName,
        ethAddress: address,
        //We have to set the state to false so signIn will be called later
        existingAccount,
        connectionState: Lib.web3provider.ConnectionState.SignInReady,
        profile: onChainProfile,
    };
}

async function connectOffchainAccount(
    connection: Lib.Connection,
    address: string,
) {
    try {
        /**
         * We've to check if the use already has a profile on the delivery service
         * if so we can use that account
         * Otherwise we use the addr_ens_subdomain
         */
        const ensName =
            (await Lib.deliveryApi.getNameForAddress(address)) ??
            getAliasForAddress(address);

        //We're trying to get the profile from the delivery service
        const profile = await Lib.account.getUserProfile(connection, ensName);

        return {
            account: ensName,
            ethAddress: address,
            existingAccount: profile !== undefined,
            connectionState: Lib.web3provider.ConnectionState.SignInReady,
            profile,
        };
    } catch (e) {
        Lib.shared.log(`Profile not found `);
        /**
         * If there is no profile on the delivery service we start the sign in process
         */
        return {
            account: undefined,
            ethAddress: address,
            existingAccount: false,
            connectionState: Lib.web3provider.ConnectionState.SignInReady,
            profile: undefined,
        };
    }
}

async function profileExistsOnDeliveryService(
    connection: Lib.Connection,
    ensName: string,
) {
    const url = `${connection.defaultServiceUrl}/profile/${ensName}`;
    try {
        const { status } = await axios.get(url);
        return status === 200;
    } catch (err) {
        return false;
    }
}
