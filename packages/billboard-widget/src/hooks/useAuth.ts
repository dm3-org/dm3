import { claimAddress } from 'dm3-lib-offchain-resolver-api';
import {
    ProfileKeys,
    createProfile,
    getDeliveryServiceProfile,
} from 'dm3-lib-profile';
import { ethers } from 'ethers';
import { DeliveryServiceClient } from '../http/DeliveryServiceClient';
import { OffchainResolverClient } from '../http/OffchainResolverClient';
import { ClientProps } from '../types';

const RANDOM_HOTWALLET_KEY = 'Billboard-Random-Hotwallet-Key';

interface BillboardHotWallet {
    keys: ProfileKeys;
    ensName: string;
    token: string;
    deliveryServiceUrl: string;
}
export const useAuth = (
    web3Provider: ethers.providers.JsonRpcProvider,
    clientProps: ClientProps,
) => {
    const getWallet = async (): Promise<BillboardHotWallet> => {
        const hotWallet = localStorage.getItem(RANDOM_HOTWALLET_KEY);
        //User has used the widget before hence we have a keypair in the local storage
        if (hotWallet) {
            return JSON.parse(hotWallet) as BillboardHotWallet;
        }
        if (
            !clientProps.siweAddress ||
            !clientProps.siweSig ||
            !clientProps.siweMessage
        ) {
            throw 'user is not logged in yet';
        }

        const deliverServiceProfile = await getDeliveryServiceProfile(
            clientProps.deliveryServiceEnsName,
            web3Provider,
            //For now just JSON profiles hosted on ENS are supported.
            //Hence we're not implementing the GetResource here
            () => Promise.resolve(undefined),
        );

        if (!deliverServiceProfile) {
            throw (
                "Can't get delivery service profile for " +
                clientProps.deliveryServiceEnsName
            );
        }

        //We need to create a new wallet hot wallet for the user
        const wallet = ethers.Wallet.createRandom();
        //Create new profile at the DS
        const profile = await createProfile(
            wallet.address,
            [clientProps.deliveryServiceEnsName],
            web3Provider,
            {
                signer: (msg: string) => wallet.signMessage(msg),
            },
        );

        const { keys, signedProfile } = profile;

        //Before we can claim a subdomain we've to claim an address first
        await claimAddress(
            wallet.address,
            clientProps.offchainResolverUrl,
            signedProfile,
        );

        //After we've claimed the address we can claim the subdomain
        await OffchainResolverClient(
            clientProps.offchainResolverUrl,
        ).claimSubdomain(
            signedProfile,
            clientProps.siweMessage,
            clientProps.siweSig,
            wallet.address,
        );

        const ensName = `${clientProps.siweAddress}.user.ethprague.dm3.eth`;

        //Finally we've to submmit the profile to the deliveryService
        const token = await DeliveryServiceClient(
            deliverServiceProfile.url,
        ).submitUserProfile(ensName, profile.signedProfile);

        if (!token) {
            throw new Error(
                'Failed to submit user profile to the delivery service',
            );
        }
        const newHotWallet: BillboardHotWallet = {
            ensName,
            keys,
            token,
            deliveryServiceUrl: deliverServiceProfile.url,
        };

        //Keep the KeyPair we just generated in the local storage so we can use them later
        localStorage.setItem(
            RANDOM_HOTWALLET_KEY,
            JSON.stringify(newHotWallet),
        );
        return newHotWallet;
    };

    return { getWallet };
};
