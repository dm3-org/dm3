import { Contract, ethers } from 'ethers';
import { log, stringify } from '../..';
import { getResolverInterface } from './getResolverInterface';
import { ResolveResponse } from './types';

export async function resolveWithProof(
    provider: ethers.providers.BaseProvider,
    resolverAddress: string,
    request: string,
    response: ResolveResponse,
) {
    const { userProfile, validUntil, sig } = response;
    try {
        const offchainResolver = new Contract(
            resolverAddress,
            getResolverInterface(),
            provider,
        );
        //Get the interface of an ResolverContract capalble of resolving text records
        const iface = getResolverInterface();
        const profileHash = iface.encodeFunctionResult('text(bytes32,string)', [
            stringify(userProfile),
        ]);

        const response = ethers.utils.defaultAbiCoder.encode(
            ['bytes', 'uint64', 'bytes'],
            [profileHash, validUntil, sig],
        );

        const resolverRes = await offchainResolver.resolveWithProof(
            response,
            request,
        );

        const [result] = iface.decodeFunctionResult('text', resolverRes);

        return result;
    } catch (e) {
        log("[ResolveWithProof], Can't resolve proof");
        throw e;
    }
}
