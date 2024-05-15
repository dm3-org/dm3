import { Account, SignedUserProfile } from '@dm3-org/dm3-lib-profile';
import { ethersHelper, stringify } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';

/**
 * TODO: Modify this function to do the transaction to remove OP name
 */
export async function getRemoveOpProfileOnchainTransaction(
    mainnetProvider: ethers.providers.StaticJsonRpcProvider,
    account: Account,
    ensName: string,
) {
    if (!account) {
        throw Error('No account');
    }
    if (!account.profile) {
        throw Error('No profile');
    }
    if (!account.profileSignature) {
        throw Error('No signature');
    }

    const ethersResolver = await ethersHelper.getResolver(
        mainnetProvider,
        ensName,
    );

    if (!ethersResolver) {
        throw Error('No resolver found');
    }

    const resolver = ethersHelper.getConractInstance(
        ethersResolver.address,
        [
            'function setText(bytes32 node, string calldata key, string calldata value) external',
        ],
        mainnetProvider,
    );

    const signedUserProfile: SignedUserProfile = {
        profile: account.profile,
        signature: account.profileSignature,
    };
    const node = ethers.utils.namehash(ensName);

    const jsonPrefix = 'data:application/json,';
    const key = 'network.dm3.profile';
    const value = jsonPrefix + stringify(signedUserProfile);

    return {
        method: resolver.setText,
        args: [node, key, value],
    };
}
