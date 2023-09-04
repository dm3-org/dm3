import { Command } from 'commander';
import { ethers } from 'ethers';

export const getSanitizedWallet = (program: Command, pk: string) => {
    if (!pk) {
        program.error('error: option --pk <pk> argument missing');
    }

    try {
        const wallet = new ethers.Wallet(pk);
        return wallet;
    } catch (err) {
        program.error('error: option --pk <pk> argument invalid');
    }
};
