import {
    SignedUserProfile,
    checkUserProfile,
    getDefaultProfileExtension,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { logDebug } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { generateAuthJWT } from './Keys';
import { Session } from './Session';

export async function submitUserProfile(
    provider: ethers.providers.JsonRpcProvider,
    getAccount: (accountAddress: string) => Promise<Session | null>,
    setAccount: (accountAddress: string, session: Session) => Promise<void>,
    ensName: string,
    signedUserProfile: SignedUserProfile,
    serverSecret: string,
): Promise<string> {
    const account = normalizeEnsName(ensName);

    if (!(await checkUserProfile(provider, signedUserProfile, account))) {
        logDebug('submitUserProfile - Signature invalid');
        throw Error('Signature invalid.');
    }
    // if (await getAccount(account)) {
    //     logDebug('submitUserProfile - Profile exists already');
    //     throw Error('Profile exists already');
    // }
    const session: Session = {
        account,
        signedUserProfile,
        token: generateAuthJWT(ensName, serverSecret),
        createdAt: new Date().getTime(),
        profileExtension: getDefaultProfileExtension(),
    };
    logDebug({ text: 'submitUserProfile', session });
    await setAccount(account.toLocaleLowerCase(), session);

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
