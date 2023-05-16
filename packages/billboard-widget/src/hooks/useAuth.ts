import { claimAddress, claimSubdomain } from 'dm3-lib-offchain-resolver-api';
import { ProfileKeys, createProfile } from 'dm3-lib-profile';
import { ethers } from 'ethers';

export interface AuthProps {
    deliveryServiceUrl: string;
    offchainResolverUrl: string;
    siweAddress: string;
    siweSig: string;
}

const RANDOM_KEYPAIR_KEY = 'Billboard-Random-Keypair-Key';

export const useAuth = (
    web3Provider: ethers.providers.JsonRpcProvider,
    authProps: AuthProps,
) => {
    const getProfileKeys = async (): Promise<ProfileKeys> => {
        const keyPair = localStorage.getItem(RANDOM_KEYPAIR_KEY);
        //User has used the widget before hence we have a keypair in the local storage
        if (keyPair) {
            return JSON.parse(keyPair) as ProfileKeys;
        }

        //We need to create a new wallet hot wallet for the user
        const wallet = ethers.Wallet.createRandom();
        //Create new profile at the DS
        const { keys, signedProfile } = await createProfile(
            wallet.address,
            [authProps.deliveryServiceUrl],
            web3Provider,
            {
                signer: (msg: string) => wallet.signMessage(msg),
            },
        );

        //Before we can claim a subdomain we've to claim an address first
        await claimAddress(
            wallet.address,
            authProps.offchainResolverUrl,
            signedProfile,
        );
        const ensName = `${wallet.address}.beta-addr.dm3.eth}`;
        //After we've claimed the address we can claim the subdomain
        await claimSubdomain(
            {
                ensName: ensName,
                profile: signedProfile.profile,
            },
            authProps.offchainResolverUrl,
            authProps.siweAddress,
            signedProfile,
        );

        //Keep the KeyPair we just generated in the local storage so we can use them later
        localStorage.setItem(RANDOM_KEYPAIR_KEY, JSON.stringify(keys));
        return keys;
    };

    return { getProfileKeys };
};
