import { Session } from '@dm3-org/dm3-lib-delivery';
import { SignedUserProfile, normalizeEnsName } from '@dm3-org/dm3-lib-profile';

export async function getUserProfile(
    getAccount: (accountAddress: string) => Promise<Session | null>,
    ensName: string,
): Promise<SignedUserProfile | undefined> {
    const account = normalizeEnsName(ensName);
    const session = await getAccount(account);
    return session?.signedUserProfile;
}
