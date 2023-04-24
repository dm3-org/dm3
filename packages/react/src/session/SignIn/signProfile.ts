import { getProfileCreationMessage } from 'dm3-lib-profile';
import { ethersHelper } from 'dm3-lib-shared';
import { ethers } from 'ethers';

export async function signProfile(
    provider: ethers.providers.JsonRpcProvider,
    personalSign: ethersHelper.PersonalSign,
    address: string,
    stringifiedProfile: string,
): Promise<string> {
    try {
        const profileCreationMessage =
            getProfileCreationMessage(stringifiedProfile);
        return await personalSign(provider, address, profileCreationMessage);
    } catch (e) {
        throw Error("Can't signIn profile");
    }
}
