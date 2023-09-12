/* eslint-disable max-len */
import { program } from 'commander';
import { ethers } from 'ethers';
import * as Installer from './installer';
import { getSanitizedWallet } from './sanitizer/getSanitizedWallet';

const cli = async () => {
    program.option('--rpc <rpc>', 'Ethereum RPC provider');
    program.option('--pk <pk>', 'ENS domain manger PK');
    program.option('--domain <domain>', 'ENS domain name e.g. yourdomain.eth');
    program.option(
        '--gateway gateway  <gateway url>',
        'gateway url used to resolve CCIP requests',
    );
    program.option(
        '--deliveryService <deliveryService>  ',
        'delivery service url',
    );
    program.option('--profilePk <profilePk>', 'Profile PK');
    program.option('--ensRegistry <ensRegistry>', 'ENS registry');
    program.option('--ensResolver <ensResolver>', 'ENS public resolver');
    program.option('--erc3668Resolver <erc3668Resolver>', 'CCIP Resolver');
    program.parse();

    const [mode] = program.args;

    switch (mode) {
        case 'setup': {
            const args = program.opts();

            const { pk, domain, gateway, rpc, profilePk, deliveryService } =
                args;

            if (!rpc) {
                program.error('error: option --rpc <rpc> argument missing');
            }

            const wallet = getSanitizedWallet(program, pk, 'pk');

            const profileWallet = getSanitizedWallet(
                program,
                profilePk ?? ethers.Wallet.createRandom().privateKey,
                'profilePk',
            );
            if (!domain) {
                program.error(
                    'error: option --domain <domain> argument missing',
                );
            }
            if (!gateway) {
                program.error(
                    'error: option --gateway <gateway> argument missing',
                );
            }
            if (!deliveryService) {
                program.error(
                    'error: option --deliveryService <deliveryService> argument missing',
                );
            }
            await Installer.setupAll({
                wallet,
                profileWallet,
                domain,
                gateway,
                rpc,
                deliveryService,
                ...args,
            });

            break;
        }
        default: {
            program.error('error: unknown option');
        }
    }
};

cli();
