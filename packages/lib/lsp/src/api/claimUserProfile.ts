import axios from 'axios';
import {
    SignedUserProfile,
    getDeliveryServiceClient,
    normalizeEnsName,
} from 'dm3-lib-profile';
import { ethers } from 'ethers';

export async function submitUserProfile(
    web3Provider: ethers.providers.JsonRpcProvider,
    baseUrl: string,
    ensName: string,
    signedUserProfile: SignedUserProfile,
) {
    const url = `${baseUrl}/profile/${normalizeEnsName(ensName)}`;

    const result = await getDeliveryServiceClient(
        signedUserProfile.profile,
        web3Provider,
        async (url: string) => (await axios.get(url)).data,
    ).post(url, signedUserProfile);

    return result.data;
}
