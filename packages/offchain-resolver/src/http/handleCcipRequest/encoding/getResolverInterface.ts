import { ethers } from 'ethers';

export function getResolverInterface() {
    return new ethers.utils.Interface([
        // eslint-disable-next-line max-len
        'function resolveWithContext(bytes calldata name,bytes calldata data,bytes calldata context) external view returns (bytes memory result)',
        //Text
        'function text(bytes32 node, string calldata key) external view returns (string memory)',
        //Address
        'function addr(bytes32 node) external view returns (address)',
    ]);
}
