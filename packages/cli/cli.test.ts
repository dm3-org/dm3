import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('cli', () => {
    let owner;
    let rpc;
    beforeEach(async () => {
        [owner] = await ethers.getSigners();
        rpc = ethers.provider.connection.url;
    });
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
                expect(res.stderr).to.equal("error: unknown option '--efeh'");
            });

            it('reverts if rpc url is undefined', async () => {
                const wallet = ethers.Wallet.createRandom();
                const res = await cli(
                    `setup --pk ${wallet.privateKey} --domain test.eth`,
                );
                expect(res.stderr).to.equal(
                    'error: option --rpc <rpc> argument missing',
                );
            });

            it('reverts if privateKey is undefined', async () => {
                const res = await cli(
                    'setup --rpc www.rpc.io --domain test.eth',
                );
                expect(res.stderr).to.equal(
                    'error: option --pk <pk> argument missing',
                );
            });
            it('reverts if privateKey is invalid', async () => {
                const res = await cli(
                    'setup --rpc www.rpc.io --domain test.eth --pk 123',
                );
                expect(res.stderr).to.equal(
                    'error: option --pk <pk> argument invalid',
                );
            });
            it('reverts if domain is undefined', async () => {
                const wallet = ethers.Wallet.createRandom();
                const res = await cli(
                    `setup --rpc www.rpc.io --pk ${wallet.privateKey}`,
                );
                expect(res.stderr).to.equal(
                    'error: option --domain <domain> argument missing',
                );
            });
            it('reverts if gateway url is undefined', async () => {
                const wallet = ethers.Wallet.createRandom();
                const res = await cli(
                    `setup --rpc www.rpc.io --pk ${wallet.privateKey} --domain test.eth`,
                );
                expect(res.stderr).to.equal(
                    'error: option --gateway <gateway> argument missing',
                );
            });
        });
        describe('setupAll', () => {
            it('test all', async () => {
                const wallet = ethers.Wallet.createRandom();
                const res = await cli(
                    `setup --rpc ${rpc} --pk ${wallet.privateKey} --domain test.eth --gateway https://gateway.io/`,
                );
            });
        });
    });
});
