import { SignedUserProfile } from 'dm3-lib-profile';
import { ethersHelper, stringify } from 'dm3-lib-shared';
import { ethers } from 'ethers';
import { Connection } from '../web3provider/Web3Provider';

export async function getPublishProfileOnchainTransaction(
    connection: Connection,
    ensName: string,
) {
    if (!connection.provider) {
        throw Error('No provider');
    }
    if (!connection.account) {
        throw Error('No account');
    }
    if (!connection.account.profile) {
        throw Error('No profile');
    }
    if (!connection.account.profileSignature) {
        throw Error('No signature');
    }

    const ethersResolver = await ethersHelper.getResolver(
        connection.provider,
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
        connection.provider,
    );

    const signedUserProfile: SignedUserProfile = {
        profile: connection.account.profile,
        signature: connection.account.profileSignature,
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
