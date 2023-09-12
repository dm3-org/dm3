import { Command } from 'commander';
import { ethers } from 'ethers';

export const getSanitizedWallet = (
    program: Command,
    pk: string,
    type: string,
) => {
    if (!pk) {
        program.error(`error: option --${type} <${type}> argument missing`);
    }

    try {
        const wallet = new ethers.Wallet(pk);
        return wallet;
    } catch (err) {
        program.error(`error: option --${type} <${type}> argument invalid`);
    }
};
