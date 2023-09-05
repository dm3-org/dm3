import { ethers } from 'ethers';
import { EnsRegistry } from './transactions/ensRegistry/EnsRegistry';
import { InstallerArgs } from './types';

const setupAll = (args: InstallerArgs) => {
    const RESOLVER = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
    const ENS_REGISTRY_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';

    const ens = EnsRegistry(ENS_REGISTRY_ADDRESS);
    //Todo add test for this
    const owner = args.mnemonic
        ? ethers.Wallet.fromMnemonic(args.mnemonic)
        : ethers.Wallet.createRandom();

    const tx = [
        //claim user,addr and ds subdomains and set resolver
        ens.setSubnodeRecord(args.domain, 'user', owner.address, RESOLVER),
        ens.setSubnodeRecord(args.domain, 'addr', owner.address, RESOLVER),
        ens.setSubnodeRecord(args.domain, 'ds', owner.address, RESOLVER),
    ];
};
export { setupAll };
