import {
    ProfileValidator,
    SignedUserProfile,
    checkUserProfileWithAddress,
    getDefaultProfileExtension,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { logDebug } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { generateAuthJWT } from '@dm3-org/dm3-lib-server-side';
import { Session } from './Session';

export async function submitUserProfile(
    luksoProvider: ethers.providers.BaseProvider,
    getAccount: (accountAddress: string) => Promise<Session | null>,
    setAccount: (accountAddress: string, session: Session) => Promise<void>,
    address: string,
    signedUserProfile: SignedUserProfile,
    serverSecret: string,
): Promise<string> {
    if (!ethers.utils.isAddress(address)) {
        logDebug('submitUserProfile - Invalid address');
        throw Error('Invalid address');
    }
    //normalize the address
    const _address = ethers.utils.getAddress(address);
    //     check if the submitted profile is has been signed by the adddress that want's to submit the profile

    const isValidProfile = await new ProfileValidator(luksoProvider).validate(
        signedUserProfile,
        _address,
    );

    if (!isValidProfile) {
        throw Error('submit user profile failed - invalid profile');
    }

    const session: Session = {
        account: _address,
        signedUserProfile,
        token: generateAuthJWT(_address, serverSecret),
        createdAt: new Date().getTime(),
        profileExtension: getDefaultProfileExtension(),
    };
    logDebug({ text: 'submitUserProfile', session });
    await setAccount(_address, session);

    return session.token;
}

// todo: remove this function (profiles should be loaded from chain and possibly cached)
export async function getUserProfile(
    getAccount: (accountAddress: string) => Promise<Session | null>,
    ensName: string,
): Promise<SignedUserProfile | undefined> {
    const account = normalizeEnsName(ensName);
    const session = await getAccount(account);
    return session?.signedUserProfile;
}
