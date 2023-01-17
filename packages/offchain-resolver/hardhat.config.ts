import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-gas-reporter';

import * as dotenv from 'dotenv';
import { HardhatNetworkUserConfig } from 'hardhat/types';

require('@nomiclabs/hardhat-ethers');
require('@typechain/hardhat');

dotenv.config();

const MAINNET_PK = process.env.MAINNET_PK ?? '';

const MAINNET_RPC = process.env.MAINNET_RPC ?? '';

const GOERLI_PK = process.env.GOERLI_PK;

const GOERLI_RPC = process.env.GOERLI_RPC ?? '';

const networks = {
    localhost: {
        url: 'http://localhost:8545',
    },
};

const getNetworks = () => {
    const networks: HardhatUserConfig['networks'] = {
        localhost: {
            url: 'http://localhost:8545',
        },
    };

    if (GOERLI_PK) {
        networks.goerli = {
            url: GOERLI_RPC,
            accounts: [GOERLI_PK],
        };
    }

    if (MAINNET_PK) {
        networks.mainnet = {
            url: MAINNET_RPC,
            accounts: [MAINNET_PK],
        };
    }

    return networks;
};

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
    networks: getNetworks(),
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
