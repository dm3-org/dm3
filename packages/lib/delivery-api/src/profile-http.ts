import {
    Account,
    normalizeEnsName,
    SignedUserProfile,
} from '@dm3-org/dm3-lib-profile';
import axios from 'axios';

import { checkAccount } from './utils';

const PROFILE_PATH = '/profile';

/**
 * submits a dm3 user profile to the delivery service
 * @param account The dm3 account
 * @param provider Ethers provider
 * @param signedUserProfile the signed user profile
 * @returns the auth token
 */
export async function submitUserProfile(
    baseUrl: string,
    account: Account,
    signedUserProfile: SignedUserProfile,
): Promise<string> {
    const { ensName } = checkAccount(account);

    const url = `${baseUrl}${PROFILE_PATH}/${ensName}`;
    console.log('submitUserProfile', url);
    const { data } = await axios.post(url, signedUserProfile);

    return data;
}
export type SubmitUserProfile = typeof submitUserProfile;
