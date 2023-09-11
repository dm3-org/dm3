import { ethers } from 'ethers';

export const EnsResolver = (address: string) => {
    const iFace = new ethers.utils.Interface([
        'function setText(bytes32 node, string calldata key, string calldata value)',
    ]);

    const setText = (domain: string, key: string, value: string) => {
        const node = ethers.utils.namehash(domain);

        const data = iFace.encodeFunctionData('setText', [node, key, value]);

        const tx: ethers.providers.TransactionRequest = {
            to: address,
            data,
        };
        return tx;
    };

    return {
        setText,
    };
};
