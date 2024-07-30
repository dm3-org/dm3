import { ethers } from 'ethers';

export interface InstallerArgs {
    wallet: ethers.Wallet; // owner of ENS domain
    profileWallet: ethers.Wallet; // account the delivery service will use.
    domain: string; // ENS domain

    deliveryService: string; // URL of the delivery service
    rpc: string; // RPC URL to send the transactions to
    ensRegistry?: string; // ENS registry address
    ensResolver?: string; // ENS public resolver address
}

export type SetupOnchainArgs = InstallerArgs;
export type SetupBillboardDsArgs = InstallerArgs & {
    gateway: string;
    erc3668Resolver?: string; // ERC3668 resolver address -> not needed for onChainDs
};
