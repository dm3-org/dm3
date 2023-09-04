/* eslint-disable max-len */
import { program } from 'commander';
import { InstallerArgs } from './installer/types';

const cli = () => {
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

    const { pk, domain, gateway }: InstallerArgs = program.opts();

    if (!pk) {
        program.error('error: option --pk <pk> argument missing');
    }
    if (!domain) {
        program.error('error: option --domain <domain> argument missing');
    }
    if (!gateway) {
        program.error('error: option --gateway <gateway> argument missing');
    }
};

cli();
