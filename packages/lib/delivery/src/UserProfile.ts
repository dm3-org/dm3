import {
    SignedUserProfile,
    checkUserProfileWithAddress,
    getDefaultProfileExtension,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { logDebug } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { generateAuthJWT } from '@dm3-org/dm3-lib-server-side';
import { Account } from './Account';

export async function submitUserProfile(
    getAccount: (accountAddress: string) => Promise<Account | null>,
    setAccount: (accountAddress: string, session: Account) => Promise<void>,
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
    const session: Account = {
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
    getAccount: (accountAddress: string) => Promise<Account | null>,
    ensName: string,
): Promise<SignedUserProfile | undefined> {
    const account = normalizeEnsName(ensName);
    const session = await getAccount(account);
    return session?.signedUserProfile;
}
