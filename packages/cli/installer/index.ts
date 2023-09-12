import { ethers } from 'ethers';
import { createDsProfile } from './tasks/createDsProfile';
import { sendTransactions } from './tasks/sendTransactions';
import { ERC3668Resolver } from './transactions/ERC3668Resolver';
import { EnsRegistry } from './transactions/EnsRegistry';
import { EnsResolver } from './transactions/EnsResolver';
import { SignatureVerifier } from './transactions/SignatureVerifier';
import { InstallerArgs } from './types';
import { printEnv } from './tasks/printEnv';

const ENS_REGISTRY_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const ENS_PUBLIC_RESOLVER_ADDRESS =
    '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const ERC3668RESOLVER_ADDRESSS = ethers.constants.AddressZero;

const setupAll = async (args: InstallerArgs) => {
    const graphQlurl = '';
    const resolverChainId = '1';
    const resolverName = 'SignatureCcipVerifier';

    //Override default addresses with optional arguments
    const ensRegistryAddress = args.ensRegistry
        ? args.ensRegistry
        : ENS_REGISTRY_ADDRESS;

    const ensPublicResolverAddress = args.ensResolver
        ? args.ensResolver
        : ENS_PUBLIC_RESOLVER_ADDRESS;

    const erc3668ResolverAddress = args.erc3668Resolver
        ? args.erc3668Resolver
        : ERC3668RESOLVER_ADDRESSS;

    const ens = EnsRegistry(ensRegistryAddress);
    const publicResolver = EnsResolver(ensPublicResolverAddress);
    const erc3668Resolver = ERC3668Resolver(erc3668ResolverAddress);

    //Create ds profile
    const { profile, keys } = await createDsProfile(args);

    const provider = new ethers.providers.StaticJsonRpcProvider(args.rpc);

    //Get the transaction count of the wallet. To be used as nonce for the transactions
    const transactionCount = await provider.getTransactionCount(
        args.wallet.address,
    );

    //VerifierAddress has to be computed in advance to be used in the other transactions
    const { verifierAddress, signatureVerifierDeployTransaction } =
        SignatureVerifier(args.wallet.address).deploy(
            args.wallet.address,
            graphQlurl,
            resolverChainId,
            resolverName,
            erc3668ResolverAddress,
            args.wallet.address,
            transactionCount + 0,
        );
    const tx = [
        //Deploy Signature Verifier
        signatureVerifierDeployTransaction,
        // Set the owner of the user domain to the wallet address
        ens.setSubnodeRecord(
            args.domain,
            'user',
            args.wallet.address,
            erc3668ResolverAddress,
            transactionCount + 1,
        ),
        // Set the owner of the addr domain to the wallet address
        ens.setSubnodeRecord(
            args.domain,
            'addr',
            args.wallet.address,
            erc3668ResolverAddress,
            transactionCount + 2,
        ),
        // Set the owner of the ds domain to the wallet address
        ens.setSubnodeRecord(
            args.domain,
            'ds',
            args.wallet.address,
            ensPublicResolverAddress,
            transactionCount + 3,
        ),
        //publish ds profile on-chain
        publicResolver.setText(
            `ds.${args.domain}`,
            'network.dm3.deliveryService',
            JSON.stringify(profile),
            transactionCount + 4,
        ),

        //set ccip resolver for user subdomain
        erc3668Resolver.setVerifierForDomain(
            `user.${args.domain}`,
            verifierAddress,
            args.gateway,
            transactionCount + 5,
        ),

        //set ccip resolver for user subdomain
        erc3668Resolver.setVerifierForDomain(
            `addr.${args.domain}`,
            verifierAddress,
            args.gateway,
            transactionCount + 6,
        ),
    ];

    await sendTransactions(args, tx);
    printEnv(args, keys);
};
export { setupAll };
