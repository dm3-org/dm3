/* eslint-disable max-len */
import { program } from 'commander';
import { InstallerArgs } from './installer/types';
import * as Installer from './installer';
import { getSanitizedWallet } from './sanitizer/getSanitizedWallet';

const cli = async () => {
    program.option('--pk <pk>', 'ENS domain manger PK');
    program.option('--domain <domain>', 'ENS domain name e.g. yourdomain.eth');
    program.option(
        '--gateway url <gateway>',
        'gateway url used to resolve CCIP requests',
    );
    program.option(
        '--mnemonic <mnemonic>',
        'Custom mnemonic for the account that will be used as an owner. If omitted, a random mnemonic will be generated.',
    );
    program.parse();

    const [mode] = program.args;

    switch (mode) {
        case 'setup': {
            const args = program.opts();

            const { pk, domain, gateway } = args;

            const wallet = getSanitizedWallet(program, pk);
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
            await Installer.setupAll({ wallet, domain, gateway });

            break;
        }
        default: {
            program.error('error: unknown option');
        }
    }
};

cli();
