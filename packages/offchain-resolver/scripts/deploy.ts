/* eslint no-console: 0 */

import { ethers } from 'hardhat';

async function main() {
    const accounts = await (ethers as any).getSigners();
    console.log('Deployment account: ' + accounts[0].address);
    const OffchainResolver = await ethers.getContractFactory(
        'OffchainResolver',
    );

    const signer = ethers.Wallet.createRandom();

    console.log(`Signer address: ${signer.address}`);
    console.log(`SIGNER PK: ${signer.privateKey}`);

    const offchainResolver = await OffchainResolver.deploy(
        'http://localhost:8081',
        accounts[0].address,
        [signer.getAddress()],
    );

    await offchainResolver.deployed();

    console.log(`Deployed to ${offchainResolver.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
