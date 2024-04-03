import { ethersHelper } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';

const dm3NameRegistrarAddressOPMainnet =
    '0xa9369F43Ab09613cA32bC3b51201493bD24CED63';

export const getDm3NameRegistrar = (
    provider: ethers.providers.StaticJsonRpcProvider,
) =>
    ethersHelper.getConractInstance(
        dm3NameRegistrarAddressOPMainnet,
        [
            'function register(string calldata name) external',
            'function owner(bytes32 node) external view returns (address)',
            'function setText(bytes32 node,string calldata key,string calldata value) external',
        ],
        provider!,
    );
