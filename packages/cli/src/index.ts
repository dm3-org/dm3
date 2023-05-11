import { program } from 'commander';
import { createProfile } from 'dm3-lib-profile/dist.backend';
import { ethers, providers } from 'ethers';

async function createWalletAndProfile() {
    const wallet = ethers.Wallet.createRandom();
    const provider = new ethers.providers.JsonRpcProvider();
    const profile = await createProfile(wallet.address, [], provider, {
        signer: (msg, address) => wallet.signMessage(msg),
    });
    console.log(profile);
}

program.name('dm3 CLI').description('dm3 utilities').version('0.1.0');

program
    .command('createProfile')
    .description('dm3 profile')
    .option('--create', 'create a dm3 user profile')

    .action((opts, options) => {
        //console.log(str);
        createWalletAndProfile();

        //console.log(options);
    });

program.parse();
