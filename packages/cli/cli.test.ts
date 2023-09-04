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

    describe('setup', () => {
        describe('sanitize input', () => {
            it('reverts for unknown input', async () => {
                const res = await cli('setup --efeh');
                expect(res.stderr).toBe("error: unknown option '--efeh'");
            });

            it('reverts if privateKey is undefined', async () => {
                const res = await cli('setup --domain test.eth');
                expect(res.stderr).toBe(
                    'error: option --pk <pk> argument missing',
                );
            });
            it('reverts if privateKey is invalid', async () => {
                const res = await cli('setup --domain test.eth --pk 123');
                expect(res.stderr).toBe(
                    'error: option --pk <pk> argument invalid',
                );
            });
            it('reverts if domain is undefined', async () => {
                const wallet = ethers.Wallet.createRandom();
                const res = await cli(`setup --pk ${wallet.privateKey}`);
                expect(res.stderr).toBe(
                    'error: option --domain <domain> argument missing',
                );
            });
            it('reverts if gateway url is undefined', async () => {
                const wallet = ethers.Wallet.createRandom();
                const res = await cli(
                    `setup --pk ${wallet.privateKey} --domain test.eth`,
                );
                expect(res.stderr).toBe(
                    'error: option --gateway <gateway> argument missing',
                );
            });
        });
    });
});
