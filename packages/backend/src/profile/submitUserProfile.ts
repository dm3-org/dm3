import {
    SignedUserProfile,
    checkUserProfile,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { generateAuthJWT } from '@dm3-org/dm3-lib-server-side';
import { logDebug } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { IBackendDatabase } from '../persistence/getDatabase';

export async function submitUserProfile(
    provider: ethers.providers.JsonRpcProvider,
    db: IBackendDatabase,
    ensName: string,
    signedUserProfile: SignedUserProfile,
    serverSecret: string,
): Promise<string> {
    const account = normalizeEnsName(ensName);

    if (!(await checkUserProfile(provider, signedUserProfile, account))) {
        logDebug('submitUserProfile - Signature invalid');
        throw Error('Signature invalid.');
    }
    if (await db.hasAccount(account)) {
        logDebug('submitUserProfile - Profile exists already');
        throw Error('Profile exists already');
    }
    logDebug({ text: 'submitUserProfile', account });

    await db.setAccount(account.toLocaleLowerCase());

    // create auth jwt
    const token = generateAuthJWT(account, serverSecret);

    return token;
}
