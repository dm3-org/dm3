import {
    SignatureCcipVerifier__factory,
    //@ts-ignore
} from 'ccip-resolver/dist/typechain/';
import { ethers } from 'ethers';

export const SignatureVerifier = () => {
    const deploy = (
        signerAddress: string,
        graphQlurl: string,
        resolverchainId: string,
        resolvername: string,
        ccipResolverAddress: string,
        ownerAddress: string,
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

        return { to: ethers.constants.AddressZero, data };
    };
    return {
        deploy,
    };
};
