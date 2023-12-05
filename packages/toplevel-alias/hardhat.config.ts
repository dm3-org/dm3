import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
    solidity: '0.8.19',
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: 'USD',
        gasPrice: 20,
    },
};

export default config;
