import { ethers } from 'ethers';

export interface InstallerArgs {
    wallet: ethers.Wallet;
    profileWallet: ethers.Wallet;
    domain: string;
    gateway: string;
    deliveryService: string;
    rpc: string;
    ensRegistry?: string;
    ensResolver?: string;
    erc3668Resolver?: string;
}
