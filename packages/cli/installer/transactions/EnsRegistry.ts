import { ethers } from 'ethers';

const TTL = 300;
export const EnsRegistry = (address: string) => {
    const iFace = new ethers.utils.Interface([
        'function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl);',
    ]);

    const setSubnodeRecord = (
        domain: string,
        label: string,
        owner: string,
        resolver: string,
    ) => {
        const node = ethers.utils.namehash(domain);
        const keccakLabel = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(label),
        );
        const data = iFace.encodeFunctionData('setSubnodeRecord', [
            node,
            keccakLabel,
            owner,
            resolver,
            TTL,
        ]);

        const tx: ethers.providers.TransactionRequest = {
            to: address,
            data,
        };
        return tx;
    };

    return {
        setSubnodeRecord,
    };
};
