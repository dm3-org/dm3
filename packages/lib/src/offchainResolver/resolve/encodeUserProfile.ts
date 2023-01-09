import { ethers, Signer } from 'ethers';
import { ResolveResponse } from '..';
import { stringify } from '../..';
import { UserProfile } from '../../account';
import { getResolverInterface } from './getResolverInterface';

export async function encodeUserProfile(
    signer: Signer,
    userProfile: UserProfile,
    resolverAddr: string,
    request: string,
    functionSelector: string,
    ttl: number = 300,
): Promise<ResolveResponse> {
    const textResolver = getResolverInterface();
    const validUntil = Math.floor(Date.now() / 1000 + ttl);

    const result = textResolver.encodeFunctionResult(functionSelector, [
        stringify(userProfile),
    ]);

    const messageHash = ethers.utils.solidityKeccak256(
        ['bytes', 'address', 'uint64', 'bytes32', 'bytes32'],
        [
            '0x1900',
            resolverAddr,
            validUntil,
            ethers.utils.keccak256(request),
            ethers.utils.keccak256(result),
        ],
    );

    const msgHashDigest = ethers.utils.arrayify(messageHash);

    const sig = await signer.signMessage(msgHashDigest);

    return { userProfile, validUntil, sig };
}
