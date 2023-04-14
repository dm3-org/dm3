import * as Lib from 'dm3-lib/dist.backend';
import ethers from 'ethers';
export const getOwnDm3Profile = async (
    provider: ethers.providers.BaseProvider,
): Promise<Lib.profile.SignedUserProfile> => {
    const ensName = process.env.ensName;
    if (!ensName) {
        throw new Error('ENS name is undefined');
    }
    const resolver = await provider.getResolver(ensName);
    const text = await resolver?.getText(Lib.profile.PROFILE_RECORD_NAME);
    if (!text) {
        throw new Error(
            `no dm3 profile found for ${ensName}. Ensure that the textRecord dm3.profile contains a valid dm3Profile`,
        );
    }
    try {
        return Lib.profile
            .JsonResolver(Lib.profile.validateSignedUserProfile)
            .resolveProfile(text);
    } catch (err) {
        throw new Error(
            `no dm3 profile found for ${ensName}. Ensure that the textRecord dm3.profile contains a valid dm3Profile`,
        );
    }
};
