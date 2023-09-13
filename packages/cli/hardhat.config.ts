import { HardhatUserConfig } from 'hardhat/types';

import('@nomiclabs/hardhat-ethers');

const config: HardhatUserConfig = {
    solidity: '0.8.17',
    networks: {
        hardhat: {},
    },
};
