import * as Lib from 'dm3-lib';
import { ethers } from 'ethers';

export async function getPublishProfileOnchainTransaction(
    connection: Lib.Connection,
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

    const ethersResolver = await Lib.external.getResolver(
        connection.provider,
        ensName,
    );
    if (!ethersResolver) {
        throw Error('No resolver found');
    }

    const resolver = Lib.external.getConractInstance(
        ethersResolver.address,
        [
            'function setText(bytes32 node, string calldata key, string calldata value) external',
        ],
        connection.provider,
    );

    const signedUserProfile: Lib.account.SignedUserProfile = {
        profile: connection.account.profile,
        signature: connection.account.profileSignature,
    };
    const node = ethers.utils.namehash(ensName);

    const jsonPrefix = 'data:application/json,';
    const key = 'network.dm3.profile';
    const value = jsonPrefix + Lib.stringify(signedUserProfile);

    return {
        method: resolver.setText,
        args: [node, key, value],
    };
}
