import { logInfo } from 'dm3-lib-shared';
import { ethers } from 'ethers';

export const ERC3668Resolver = (address: string) => {
    const iFace = new ethers.utils.Interface([
        'function setVerifierForDomain(bytes32 node, address verifierAddress, string[] memory urls)',
    ]);

    const setVerifierForDomain = (
        domain: string,
        verifierAddress: string,
        gatewayUrl: string,
        nonce: number,
    ) => {
        const node = ethers.utils.namehash(domain);

        const data = iFace.encodeFunctionData('setVerifierForDomain', [
            node,
            verifierAddress,
            [gatewayUrl],
        ]);

        const tx: ethers.providers.TransactionRequest = {
            to: address,
            data,
            nonce,
            gasLimit: 215000,
        };
        logInfo(
            `set ccip resolver for ${domain} to ${verifierAddress} at nonce ${nonce}`,
        );
        return tx;
    };

    return {
        setVerifierForDomain,
    };
};
