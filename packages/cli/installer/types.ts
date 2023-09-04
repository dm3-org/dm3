import { ethers } from 'ethers';

export interface InstallerArgs {
    wallet: ethers.Wallet;
    domain: string;
    gateway: string;
    mnemonic?: string;
}
