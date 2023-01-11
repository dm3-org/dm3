import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';

import * as dotenv from 'dotenv';
require('@nomiclabs/hardhat-ethers');
require('@typechain/hardhat');
require('@nomiclabs/hardhat-ethers');

dotenv.config();

const config: HardhatUserConfig = {
    solidity: '0.8.17',
    etherscan: {
        apiKey: '',
    },
    networks: {
        localhost: {
            url: 'http://localhost:8545',
        },
    },
    typechain: {
        outDir: 'typechain',
        target: 'ethers-v5',
    },
};

export default config;
