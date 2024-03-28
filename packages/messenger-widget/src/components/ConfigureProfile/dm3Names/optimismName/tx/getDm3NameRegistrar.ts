import { ethersHelper } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';

const dm3NameRegistrarAddressSepolia =
    '0xF5b24cD05D6e6E9b8AC2B97cD90C38a8F2Df57FB';

export const getDm3NameRegistrar = (
    provider: ethers.providers.StaticJsonRpcProvider,
) =>
    ethersHelper.getConractInstance(
        dm3NameRegistrarAddressSepolia,
        [
            'function register(string calldata name) external',
            'function owner(bytes32 node) external view returns (address)',
            'function setText(bytes32 node,string calldata key,string calldata value) external',
        ],
        provider!,
    );
