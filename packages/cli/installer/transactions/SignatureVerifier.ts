import {
    SignatureCcipVerifier__factory,
    //@ts-ignore
} from 'ccip-resolver/dist/typechain/';
import { log, logInfo } from 'dm3-lib-shared';
import { BigNumber, ethers } from 'ethers';
import { RLP, keccak256 } from 'ethers/lib/utils';

export const SignatureVerifier = (deployer: string) => {
    const deploy = (
        signerAddress: string,
        graphQlurl: string,
        resolverchainId: string,
        resolvername: string,
        ccipResolverAddress: string,
        ownerAddress: string,
        nonce: number,
    ) => {
        const { data } =
            new SignatureCcipVerifier__factory().getDeployTransaction(
                signerAddress,
                graphQlurl,
                resolvername,
                resolverchainId,
                ccipResolverAddress,
                [ownerAddress],
            );
        const verifierAddress =
            '0x' +
            keccak256(
                RLP.encode([deployer, BigNumber.from(nonce)._hex]),
            ).substring(26);

        const signatureVerifierDeployTransaction = {
            data,
            nonce,
            gasLimit: 2000000,
        };
        logInfo(
            `Deploy SignatureVerifier at ${verifierAddress} with nonce ${nonce}`,
        );
        return { verifierAddress, signatureVerifierDeployTransaction };
    };
    return {
        deploy,
    };
};
