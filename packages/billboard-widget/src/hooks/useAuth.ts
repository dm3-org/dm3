import { claimAddress } from 'dm3-lib-offchain-resolver-api';
import { ProfileKeys, createProfile } from 'dm3-lib-profile';
import { ethers } from 'ethers';
import { OffchainResolverClient } from '../http/OffchainResolverClient';
import { ClientProps } from '../types';

const RANDOM_HOTWALLET_KEY = 'Billboard-Random-Hotwallet-Key';

interface BillboardHotWallet {
    keys: ProfileKeys;
    ensName: string;
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

        //We need to create a new wallet hot wallet for the user
        const wallet = ethers.Wallet.createRandom();
        //Create new profile at the DS
        const profile = await createProfile(
            wallet.address,
            [clientProps.deliveryServiceUrl],
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
        const newHotWallet: BillboardHotWallet = {
            ensName,
            keys,
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
