import { ethers, Signer } from 'ethers';
import { ResolveResponse } from '.';
import { stringify } from './..';
import { UserProfile } from './../account';
import { getResolverInterface } from './getResolverInterface';

/**
 * @param signer A signer to sign the request. The address of the signer HAS to be part of
 *  the signers array of the Offchain Resolver otherwise {@see resolveWithProof} will fail
 * @param userProfile A userprofile Object according to the dm3 specification
 * @param resolverAddr The addrees of the Offchain Resolver smart contract
 * @param request The calldata the resolve method of the OffchainProcessor returns {@see decodeCalldata}
 * @param functionSelector The selector that was used to query the profile entry in the first place
 * @param ttl the time to life to calculate validUntil.
 * @returns {@see ResolveResponse}
 */
export async function encodeUserProfile(
    signer: Signer,
    userProfile: UserProfile,
    resolverAddr: string,
    request: string,
    functionSelector: string,
    ttl: number = 300,
): Promise<string> {
    const textResolver = getResolverInterface();
    const validUntil = Math.floor(Date.now() / 1000 + ttl);

    const result = textResolver.encodeFunctionResult(functionSelector, [
        stringify(userProfile),
    ]);
    /**
     * This hash has to be compiled the same way as at the OffchainResolver.makeSignatureHash method
     * since it'll be compared within the {@see resolveWithProof} function
     */

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
    /**
     * The signature is used to verify onchain if this response object was indeed signed by a valid signer
     */
    const sig = await signer.signMessage(msgHashDigest);

    return ethers.utils.defaultAbiCoder.encode(
        ['bytes', 'uint64', 'bytes'],
        [result, validUntil, sig],
    );
}
