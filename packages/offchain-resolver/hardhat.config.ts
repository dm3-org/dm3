import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-gas-reporter';

import * as dotenv from 'dotenv';
require('@nomiclabs/hardhat-ethers');
require('@typechain/hardhat');

dotenv.config();

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.4',
        settings: {
            optimizer: {
                enabled: true,
                // eslint-disable-next-line max-len
                //I think it make sense to optimize for cheap deployment since setOwner or addSince will not be used often
                runs: 1,
            },
        },
    },

    etherscan: {
        apiKey: '',
    },
    networks: {
        localhost: {
            url: 'http://localhost:8545',
        },
        goerli: {
            url: process.env.GOERLI_RPC,
            accounts: [process.env.GOERLI_PK as string],
        },
        mainnet: {
            url: process.env.MAINNET_RPC,
            accounts: [process.env.MAINNET_PK as string],
        },
    },
    typechain: {
        outDir: 'typechain',
        target: 'ethers-v5',
    },
    gasReporter: {
        currency: 'USD',
        gasPrice: 21,
        enabled: true,
    },
};

export default config;
