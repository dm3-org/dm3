import { ethers } from 'ethers';
import * as Lib from 'dm3-lib';

export async function signProfile(
    provider: ethers.providers.JsonRpcProvider,
    personalSign: Lib.shared.ethersHelper.PersonalSign,
    address: string,
    stringifiedProfile: string,
): Promise<string> {
    try {
        const profileCreationMessage =
            Lib.profile.getProfileCreationMessage(stringifiedProfile);
        return await personalSign(provider, address, profileCreationMessage);
    } catch (e) {
        throw Error("Can't signIn profile");
    }
}
