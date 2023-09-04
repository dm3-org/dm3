import { ethers } from 'ethers';
describe('cli', () => {
    const execa = require('execa');
    const cli = (argv = ''): any =>
        new Promise((resolve, reject) => {
            const subprocess = execa.command(`yarn start ${argv}`);
            subprocess.stdout.pipe(process.stdout);
            subprocess.stderr.pipe(process.stderr);
            Promise.resolve(subprocess).then(resolve).catch(resolve);
        });

    describe('sanizite input', () => {
        it('reverts for unknown input', async () => {
            const res = await cli('--efeh');
            expect(res.stderr).toBe("error: unknown option '--efeh'");
        });

        it('reverts if privateKey is undefined', async () => {
            const res = await cli('--domain test.eth');
            expect(res.stderr).toBe('error: option --pk <pk> argument missing');
        });
        it('reverts if domain is undefined', async () => {
            const wallet = ethers.Wallet.createRandom();
            const res = await cli(`--pk ${wallet.privateKey}}`);
            expect(res.stderr).toBe(
                'error: option --domain <domain> argument missing',
            );
        });
        it('reverts if gateway url is undefined', async () => {
            const wallet = ethers.Wallet.createRandom();
            const res = await cli(
                `--pk ${wallet.privateKey}} --domain test.eth`,
            );
            expect(res.stderr).toBe(
                'error: option --gateway <gateway> argument missing',
            );
        });
    });
});
