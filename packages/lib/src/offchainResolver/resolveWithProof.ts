import { Contract, ethers } from 'ethers';
import { log, stringify } from './..';
import { getResolverInterface } from './getResolverInterface';
import { CiipResponse } from './types';

/**
 * This funcition can by used by a client to ensure onchain that the {@see UserProfile} returned by the ciip gateway
 * is valid and was signed by a certain signer specified at the OffchainResolver contract
 * @param provider {@see ether.BaseProvider}
 * @param resolverAddress the address of the OffchainResolver Smart contract.
 * @param request the calldata returned be the resolved method of the OffchainResolver Smart contract
 * @param response {@see CiipResponse}
 * @returns See resolved {@see UserProfile} if sucesfully validated onchain
 */
export async function resolveWithProof(
    provider: ethers.providers.BaseProvider,
    resolverAddress: string,
    request: string,
    response: CiipResponse,
) {
    const { userProfile, validUntil, sig } = response;
    try {
        const offchainResolver = new Contract(
            resolverAddress,
            getResolverInterface(),
            provider,
        );

        const textResolver = getResolverInterface();

        const profileHash = textResolver.encodeFunctionResult(
            'text(bytes32,string)',
            [stringify(userProfile)],
        );

        /**
         * The response has to be compiled the same way as in SignatureVerifier.verify
         * Otherwise {@see resolveWithProof} will fail
         */
        const response = ethers.utils.defaultAbiCoder.encode(
            ['bytes', 'uint64', 'bytes'],
            [profileHash, validUntil, sig],
        );

        const resolverRes = await offchainResolver.resolveWithProof(
            response,
            request,
        );

        const [result] = textResolver.decodeFunctionResult('text', resolverRes);

        return result;
    } catch (e) {
        log("[ResolveWithProof], Can't resolve proof");
        throw e;
    }
}
