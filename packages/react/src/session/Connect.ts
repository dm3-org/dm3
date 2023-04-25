import axios from 'axios';
import { getNameForAddress } from 'dm3-lib-delivery-api';
import {
    SignedUserProfile,
    checkUserProfile,
    getUserProfile,
} from 'dm3-lib-profile';
import { ethersHelper, globalConfig, log } from 'dm3-lib-shared';
import { Connection, ConnectionState } from '../web3provider/Web3Provider';

export function getAliasForAddress(address: string) {
    return address + globalConfig.ADDR_ENS_SUBDOMAIN();
}

export async function connectEthAccount(
    connection: Connection,
    requestAccounts: ethersHelper.RequestAccounts,
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
        const address =
            preSetAccount ?? (await requestAccounts(connection.provider));

        const ensName = await connection.provider.lookupAddress(address);
        return ensName
            ? await connectOnchainAccount(connection, ensName, address)
            : await connectOffchainAccount(connection, address);
    } catch (e) {
        log((e as Error).message);
        return {
            existingAccount: false,
            connectionState: ConnectionState.ConnectionRejected,
        };
    }
}

async function connectOnchainAccount(
    connection: Connection,
    ensName: string,
    address: string,
) {
    const onChainProfile = await getUserProfile(connection.provider!, ensName);

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
    const isProfileValid = await checkUserProfile(
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
        connectionState: ConnectionState.SignInReady,
        profile: onChainProfile,
    };
}

async function connectOffchainAccount(connection: Connection, address: string) {
    try {
        /**
         * We've to check if the use already has a profile on the delivery service
         * if so we can use that account
         * Otherwise we use the addr_ens_subdomain
         */
        const ensName =
            (await getNameForAddress(address)) ?? getAliasForAddress(address);

        //We're trying to get the profile from the delivery service
        const profile = await getUserProfile(connection.provider!, ensName);

        return {
            account: ensName,
            ethAddress: address,
            existingAccount: profile !== undefined,
            connectionState: ConnectionState.SignInReady,
            profile,
        };
    } catch (e) {
        log(`Profile not found `);
        /**
         * If there is no profile on the delivery service we start the sign in process
         */
        return {
            account: undefined,
            ethAddress: address,
            existingAccount: false,
            connectionState: ConnectionState.SignInReady,
            profile: undefined,
        };
    }
}

async function profileExistsOnDeliveryService(
    connection: Connection,
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
