/* eslint-disable no-console */
import { getNameForAddress } from 'dm3-lib-offchain-resolver-api';
import { checkUserProfile, getUserProfile } from 'dm3-lib-profile';
import { log } from 'dm3-lib-shared';
import { getAliasForAddress } from '../../components/SignIn/bl';
import { ethers } from 'ethers';

export const AccountConnector = (
    mainnetProvider: ethers.providers.JsonRpcProvider,
) => {
    async function connectOffchainAccount(address: string) {
        try {
            /**
             * We've to check if the use already has a profile on the delivery service
             * if so we can use that account
             * Otherwise we use the addr_ens_subdomain
             */
            const ensName =
                (await getNameForAddress(
                    address,
                    process.env.REACT_APP_RESOLVER_BACKEND as string,
                )) ?? getAliasForAddress(address);

            //We're trying to get the profile from the delivery service
            const userProfile = await getUserProfile(mainnetProvider, ensName);

            return { ensName, userProfile };
        } catch (e) {
            console.log('error ', e);
            //TODO handle error
            log(`Profile not found ` + JSON.stringify(e), 'error');
            return undefined;
        }
    }
    async function connectOnchainAccount(ensName: string, address: string) {
        let onChainProfile;

        try {
            onChainProfile = await getUserProfile(mainnetProvider!, ensName);
        } catch (error) {
            log(
                'Cant load profile from chain' + JSON.stringify(error),
                'error',
            );
            onChainProfile = undefined;
        }

        /**
         * If it turns out there is no on chain profile available
         * we proceed trying to connect the account with an offchain profile
         */
        if (!onChainProfile) {
            return await connectOffchainAccount(address);
        }
        /**
         * We've to check wether the profile published on chain belongs to the address we're trying to connectÌ
         */
        const isProfileValid = await checkUserProfile(
            mainnetProvider,
            onChainProfile,
            address,
        );

        if (!isProfileValid) {
            throw Error('Profile signature is invalid');
        }

        return {
            userProfile: onChainProfile,
            ensName,
        };
    }

    const connect = async (address: string) => {
        try {
            const onChainEnsName = await mainnetProvider.lookupAddress(address);
            return onChainEnsName
                ? await connectOnchainAccount(onChainEnsName, address)
                : await connectOffchainAccount(address);
        } catch (e) {
            console.log(e);
            //TODO handle error
            /*           changeSignInButtonStyle(
                          'sign-in-btn',
                          'normal-btn-hover',
                          'normal-btn',
                      );
                      log('[connectEthAccount] ' + JSON.stringify(e), 'error'); */
        }
    };
    return {
        connect,
    };
};
