import { Signer } from 'ethers';
import { UserProfile } from '../../account';
import { stringify } from '../../shared/stringify';
import { OffchainUserProfile } from '../OffchainUserProfile';

export async function signProfile(
    signer: Signer[],
    profile: UserProfile,
): Promise<OffchainUserProfile> {
    const signatures = await Promise.all(
        signer.map((s) => s.signMessage(stringify(profile))),
    );

    return {
        profile,
        signatures,
    };
}
