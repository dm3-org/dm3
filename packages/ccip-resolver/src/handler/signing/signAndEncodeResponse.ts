import { ethers, Signer } from 'ethers';

/**
 * @param signer A signer to sign the request. The address of the signer HAS to be part of
 *  the signers array of the Offchain Resolver otherwise {@see resolveWithProof} will fail
 * @param resolverAddr The addrees of the Offchain Resolver smart contract
 * @param result The actual data
 * @param request The calldata the resolve method of the OffchainProcessor returns {@see decodeCalldata}
 * @param ttl the time to life to calculate validUntil.
 * @returns the encoded response
 */
export async function signAndEncodeResponse(
    signer: Signer,
    resolverAddr: string,
    result: string,
    calldata: string,
    ttl: number = 30000,
): Promise<string> {
    const validUntil = Math.floor(Date.now() / 1000 + ttl);

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
            ethers.utils.keccak256(calldata),
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
