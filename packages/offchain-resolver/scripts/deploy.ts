/* eslint no-console: 0 */

import { ethers } from 'hardhat';

async function main() {
    const accounts = await (ethers as any).getSigners();
    console.log('Deployment account: ' + accounts[0].address);
    const OffchainResolver = await ethers.getContractFactory(
        'OffchainResolver',
    );

    const offchainResolver = await OffchainResolver.deploy(
        'http://localhost:8081/{sender}/{data}.json',
        accounts[0].address,
        ['0x300AdE3DF46e3531004F9c0E19EdEa62Be3f67f2'],
    );

    await offchainResolver.deployed();

    console.log(`Deployed to ${offchainResolver.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
