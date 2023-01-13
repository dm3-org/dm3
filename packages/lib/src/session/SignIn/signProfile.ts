import { ethers } from 'ethers';
import { getProfileCreationMessage } from '../../account/Account';
import { PersonalSign } from '../../external-apis/InjectedWeb3API';

export async function signProfile(
    provider: ethers.providers.JsonRpcProvider,
    personalSign: PersonalSign,
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
