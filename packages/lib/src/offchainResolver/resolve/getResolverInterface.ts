import { ethers } from 'ethers';

export function getResolverInterface() {
    return new ethers.utils.Interface([
        'function resolve(bytes calldata name, bytes calldata data) external view returns(bytes)',
        'function text(bytes32 node, string calldata key) external view returns (string memory)',
    ]);
}
