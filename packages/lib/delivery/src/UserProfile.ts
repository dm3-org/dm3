import {
    SignedUserProfile,
    checkUserProfileWithAddress,
    getDefaultProfileExtension,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { logDebug } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { generateAuthJWT } from './Keys';
import { Session } from './Session';

export async function submitUserProfile(
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
    if (!(await checkUserProfileWithAddress(signedUserProfile, _address))) {
        logDebug('submitUserProfile - Signature invalid');
        throw Error('Signature invalid.');
    }
    if (await getAccount(_address)) {
        logDebug('submitUserProfile - Profile exists already');
        throw Error('Profile exists already');
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

export async function getUserProfile(
    getAccount: (accountAddress: string) => Promise<Session | null>,
    ensName: string,
): Promise<SignedUserProfile | undefined> {
    const account = normalizeEnsName(ensName);
    const session = await getAccount(account);
    return session?.signedUserProfile;
}
