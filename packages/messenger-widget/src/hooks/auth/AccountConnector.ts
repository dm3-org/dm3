/* eslint-disable max-len */
/* eslint-disable no-console */
import { createWeb3Name } from '@web3-name-sdk/core';
import { getNameForAddress } from 'dm3-lib-offchain-resolver-api';
import { checkUserProfile, getUserProfile } from 'dm3-lib-profile';
import { globalConfig, log } from 'dm3-lib-shared';
import { ethers } from 'ethers';
import { WalletClient } from 'viem';

function getAliasForAddress(address: string) {
    return address + globalConfig.ADDR_ENS_SUBDOMAIN();
}

export const AccountConnector = (
    walletClient: WalletClient,
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
            log(`Profile not found ` + e, 'error');
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

    //Add support for other chains when the refactoring is finished and we do more integrations
    async function getOnChainEnsName(address: string) {
        //@ts-ignore
        const chainId = await walletClient.getChainId();
        // either chidaodo or xdai
        if (chainId === 10200 || chainId === 100) {
            const web3Name = createWeb3Name();

            const spaceIdWeb3Name = await web3Name.getDomainName({
                address,
                queryChainIdList: [chainId],
            });
            //User is connected with an address that has no genome name yet
            if (!spaceIdWeb3Name) {
                return undefined;
            }

            console.log(
                `resolved genome name ${spaceIdWeb3Name} for ${address}`,
            );

            //hardcode genome name and move to LIB fn
            const resolvedTLD = 'alex1234.eth';
            const l1EnsName = spaceIdWeb3Name.replace(
                '.gno',
                '.' + resolvedTLD,
            );
            return l1EnsName;
        }

        return await mainnetProvider.lookupAddress(address);
    }

    const connect = async (address: string) => {
        try {
            const onChainEnsName = await getOnChainEnsName(address);

            console.log('connect with onchain name', onChainEnsName);
            return onChainEnsName
                ? await connectOnchainAccount(onChainEnsName, address)
                : await connectOffchainAccount(address);
        } catch (e) {
            console.log(e);
        }
    };
    return {
        connect,
    };
};

//Staging

/* dm3.chat wants you to sign in with your Ethereum account:
0x7A9D5c989c6fFA3C4A709fE4EDA1A8B5894b5a2A

Connect the DM3 MESSENGER with your wallet. Keys for secure communication are derived from this signature.

(There is no paid transaction initiated. The signature is used off-chain only.)

URI: https://dm3.chat
Version: 1
Nonce: 0xa1b38837dd52e70a250ac2bf3e19f1599833e9d30662bf69a1c12e5747ed9f65 */

/*dm3.chat wants you register your dm3 profile with your Ethereum account:
0x7A9D5c989c6fFA3C4A709fE4EDA1A8B5894b5a2A

This is required only once!
(There is no paid transaction initiated. The signature is used off-chain only.)

URI: https://dm3.chat
Version: 1
dm3 Profile: {"deliveryServices":["beta-ds.dm3.eth"],"publicEncryptionKey":"cPjbDsDGD+jjwGYS4u889jDr5wMTl/4Be8JbQcJo+DU=","publicSigningKey":"JtV1wYrjqvWdG5gxCrAIueRezfVGy0f56nZwA8CW53o="}*/

//Mainnet

/* dm3.chat wants you to sign in with your Ethereum account:
0x7A9D5c989c6fFA3C4A709fE4EDA1A8B5894b5a2A

Connect the DM3 MESSENGER with your wallet. Keys for secure communication are derived from this signature.

(There is no paid transaction initiated. The signature is used off-chain only.)

URI: https://dm3.chat
Version: 1
Nonce: 0xa1b38837dd52e70a250ac2bf3e19f1599833e9d30662bf69a1c12e5747ed9f65 */

/* dm3.chat wants you register your dm3 profile with your Ethereum account:
0x7A9D5c989c6fFA3C4A709fE4EDA1A8B5894b5a2A

This is required only once!
(There is no paid transaction initiated. The signature is used off-chain only.)

URI: https://dm3.chat
Version: 1
dm3 Profile: {"deliveryServices":["ds.dm3.eth"],"publicEncryptionKey":"cPjbDsDGD+jjwGYS4u889jDr5wMTl/4Be8JbQcJo+DU=","publicSigningKey":"JtV1wYrjqvWdG5gxCrAIueRezfVGy0f56nZwA8CW53o="} */
