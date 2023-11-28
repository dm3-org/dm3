/* eslint-disable max-len */
import { program } from 'commander';
import { ethers } from 'ethers';
import * as Installer from './installer';
import { getSanitizedWallet } from './sanitizer/getSanitizedWallet';

const cli = async () => {
    program.option('--rpc <rpc>', 'The Ethereum RPC URL to connect to');
    program.option(
        '--pk <pk>',
        'The private key of the account owning the domain. That account will be used to execute the tx and has to be funded accordingly',
    );
    program.option(
        '--domain <domain>',
        'The ENS (Ethereum Name Service) domain associated with dm3. It has to be owned by the account used as Private Key',
    );
    program.option(
        '--gateway gateway  <gateway url>',
        'The URL of the gateway service used for ccip data retrieval',
    );
    program.option(
        '--deliveryService <deliveryService>  ',
        'The URL of the delivery service',
    );
    program.option(
        '--profilePk <profilePk>',
        'The private key used as a seed to create the delivery service. When omitted, a random private key will be created.',
    );
    program.option(
        '--ensRegistry <ensRegistry>',
        'The address of the ENS registry contract',
    );
    program.option(
        '--ensResolver <ensResolver>',
        'The address of the ENS public resolver contract',
    );
    program.option(
        '--erc3668Resolver <erc3668Resolver>',
        'The address of the ERC3668 resolver contract',
    );
    program.parse();

    // Every mode is prefixed with setup so we only have to differentiate the second arg
    const [, mode] = program.args;

    switch (mode) {
        case 'billboardDs': {
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
            await Installer.setupBillboardDs({
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
