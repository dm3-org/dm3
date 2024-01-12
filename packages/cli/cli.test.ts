import {
    ENSRegistry__factory,
    ERC3668Resolver__factory,
} from 'ccip-resolver/dist/typechain/';
import { expect } from 'chai';
import { Wallet } from 'ethers';
import execa from 'execa';
import { ethers } from 'hardhat';

import publicResolverArtifact from '@ensdomains/resolver/build/contracts/PublicResolver.json';
import {
    createKeyPair,
    createSigningKeyPair,
    createStorageKey,
} from '@dm3-org/dm3-lib-crypto';
describe('cli', () => {
    let alice, owner: Wallet;
    let rpc: string;
    let ensRegistry, publicResolver, erc3668Resolver;

    afterEach(async () => {
        await execa.command(`lsof -ti :8545 | xargs kill -9`, {
            shell: true,
        });
    });

    beforeEach(async () => {
        execa.command(`yarn start-hh-node`, {
            detached: true,
        });

        const wait = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

        //Wait unitl hh node has started
        await wait(2000);

        rpc = ethers.provider.connection.url;

        const provider = new ethers.providers.JsonRpcProvider(
            'http://127.0.0.1:8545/',
        );

        alice = new Wallet(
            '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
        );

        owner = new Wallet(
            '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
        );

        const ownerWithProvider = owner.connect(provider);
        const aliceWithProvider = alice.connect(provider);

        ensRegistry = await new ENSRegistry__factory()
            .connect(ownerWithProvider)
            .deploy();
        erc3668Resolver = await new ERC3668Resolver__factory()
            .connect(ownerWithProvider)
            .deploy(
                ensRegistry.address,
                ethers.constants.AddressZero,
                ethers.constants.AddressZero,
                [],
            );

        publicResolver = await new ethers.ContractFactory(
            publicResolverArtifact.abi,
            publicResolverArtifact.bytecode,
            ownerWithProvider,
        ).deploy(ensRegistry.address, {
            gasLimit: 5000000,
        });

        await ensRegistry
            .connect(ownerWithProvider)
            .setOwner(ethers.constants.HashZero, alice.address);

        await ensRegistry
            .connect(aliceWithProvider)
            .setSubnodeOwner(
                ethers.constants.HashZero,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('eth')),
                alice.address,
                {
                    gasLimit: 500000,
                },
            );

        await ensRegistry
            .connect(aliceWithProvider)
            .setSubnodeOwner(
                ethers.utils.namehash('eth'),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('alice')),
                alice.address,
                {
                    gasLimit: 500000,
                },
            );
        await ensRegistry
            .connect(aliceWithProvider)
            .setSubnodeOwner(
                ethers.utils.namehash('alice.eth'),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('a')),
                alice.address,
                {
                    gasLimit: 500000,
                },
            );
    });

    const cli = (argv = ''): any =>
        new Promise((resolve, reject) => {
            const subprocess = execa.command(`yarn run ${argv}`);
            subprocess.stdout!.pipe(process.stdout);
            subprocess.stderr!.pipe(process.stderr);
            Promise.resolve(subprocess).then(resolve).catch(resolve);
        });

    describe('setup billboardDs', () => {
        describe('sanitize input', () => {
            it('reverts for unknown input', async () => {
                const res = await cli('dm3 setup billboardDs --efeh');
                expect(res.stderr).to.equal("error: unknown option '--efeh'");
            });

            it('reverts if rpc url is undefined', async () => {
                const wallet = ethers.Wallet.createRandom();
                const res = await cli(
                    `dm3 setup billboardDs --pk ${wallet.privateKey} --domain test.eth`,
                );
                expect(res.stderr).to.equal(
                    'error: option --rpc <rpc> argument missing',
                );
            });

            it('reverts if privateKey is undefined', async () => {
                const res = await cli(
                    'dm3 setup billboardDs --rpc www.rpc.io --domain test.eth',
                );
                expect(res.stderr).to.equal(
                    'error: option --pk <pk> argument missing',
                );
            });
            it('reverts if privateKey is invalid', async () => {
                const res = await cli(
                    'dm3 setup billboardDs --rpc www.rpc.io --domain test.eth --pk 123',
                );
                expect(res.stderr).to.equal(
                    'error: option --pk <pk> argument invalid',
                );
            });
            it('reverts if domain is undefined', async () => {
                const wallet = ethers.Wallet.createRandom();
                const res = await cli(
                    `dm3 setup billboardDs --rpc www.rpc.io --pk ${wallet.privateKey}`,
                );
                expect(res.stderr).to.equal(
                    'error: option --domain <domain> argument missing',
                );
            });
            it('reverts if gateway url is undefined', async () => {
                const wallet = ethers.Wallet.createRandom();
                const res = await cli(
                    `dm3 setup billboardDs --rpc www.rpc.io --pk ${wallet.privateKey} --domain test.eth`,
                );
                expect(res.stderr).to.equal(
                    'error: option --gateway <gateway> argument missing',
                );
            });
        });
        describe('setup billboardDsAll', () => {
            it('test all', async () => {
                const owner = ethers.Wallet.createRandom();

                const res = await cli(
                    `dm3 setup billboardDs 
                    --rpc  http://127.0.0.1:8545
                    --pk ${alice.privateKey} 
                    --domain alice.eth 
                    --gateway https://gateway.io/  
                    --deliveryService https://ds.io/ 
                    --profilePk ${owner.privateKey} 
                    --ensRegistry ${ensRegistry.address} 
                    --ensResolver ${publicResolver.address} 
                    --erc3668Resolver ${erc3668Resolver.address}`,
                );
                expect(
                    await ensRegistry.owner(
                        ethers.utils.namehash('user.alice.eth'),
                    ),
                ).to.equal(alice.address);
                expect(
                    await ensRegistry.owner(
                        ethers.utils.namehash('addr.alice.eth'),
                    ),
                ).to.equal(alice.address);
                expect(
                    await ensRegistry.owner(
                        ethers.utils.namehash('ds.alice.eth'),
                    ),
                ).to.equal(alice.address);

                const profile = await publicResolver.text(
                    ethers.utils.namehash('ds.alice.eth'),
                    'network.dm3.deliveryService',
                );
                expect(JSON.parse(profile).url).to.equal('https://ds.io/');

                const encryptionKeyPair = await createKeyPair(
                    await createStorageKey(owner.privateKey),
                );
                const signingKeyPair = await createSigningKeyPair(
                    await createStorageKey(owner.privateKey),
                );

                expect(JSON.parse(profile).publicEncryptionKey).to.equal(
                    encryptionKeyPair.publicKey,
                );
                expect(JSON.parse(profile).publicSigningKey).to.equal(
                    signingKeyPair.publicKey,
                );

                expect(
                    await erc3668Resolver.ccipVerifier(
                        ethers.utils.namehash('user.alice.eth'),
                    ),
                ).to.not.equal(ethers.constants.AddressZero);
                expect(
                    await erc3668Resolver.ccipVerifier(
                        ethers.utils.namehash('addr.alice.eth'),
                    ),
                ).to.not.equal(ethers.constants.AddressZero);
            });
            it('test all with random profile wallet', async () => {
                const res = await cli(
                    `dm3 setup billboardDs 
                    --rpc  http://127.0.0.1:8545
                    --pk ${alice.privateKey} 
                    --domain alice.eth 
                    --gateway https://gateway.io/  
                    --deliveryService https://ds.io/ 
                    --ensRegistry ${ensRegistry.address} 
                    --ensResolver ${publicResolver.address} 
                    --erc3668Resolver ${erc3668Resolver.address}`,
                );
                expect(
                    await ensRegistry.owner(
                        ethers.utils.namehash('user.alice.eth'),
                    ),
                ).to.equal(alice.address);
                expect(
                    await ensRegistry.owner(
                        ethers.utils.namehash('addr.alice.eth'),
                    ),
                ).to.equal(alice.address);
                expect(
                    await ensRegistry.owner(
                        ethers.utils.namehash('ds.alice.eth'),
                    ),
                ).to.equal(alice.address);

                const profile = await publicResolver.text(
                    ethers.utils.namehash('ds.alice.eth'),
                    'network.dm3.deliveryService',
                );
                expect(JSON.parse(profile).url).to.equal('https://ds.io/');

                expect(JSON.parse(profile).publicEncryptionKey).to.not.be
                    .undefined;
                expect(JSON.parse(profile).publicSigningKey).to.not.be
                    .undefined;

                expect(
                    await erc3668Resolver.ccipVerifier(
                        ethers.utils.namehash('user.alice.eth'),
                    ),
                ).to.not.equal(ethers.constants.AddressZero);
                expect(
                    await erc3668Resolver.ccipVerifier(
                        ethers.utils.namehash('addr.alice.eth'),
                    ),
                ).to.not.equal(ethers.constants.AddressZero);
            });
            it('rejects with underfunded balance', async () => {
                const provider = new ethers.providers.JsonRpcProvider(
                    'http://127.0.0.1:8545/',
                );

                const underfundedWallet = ethers.Wallet.createRandom();
                //Send a little bit of ETH to the wallet. Although its to little to pay for the transactions
                await owner.connect(provider).sendTransaction({
                    to: underfundedWallet.address,
                    value: ethers.utils.parseEther('0.0001'),
                });
                const balanceBefore = await provider.getBalance(
                    underfundedWallet.address,
                );

                const res = await cli(
                    `dm3 setup billboardDs 
                    --rpc  http://127.0.0.1:8545
                    --pk ${underfundedWallet.privateKey} 
                    --domain alice.eth 
                    --gateway https://gateway.io/  
                    --deliveryService https://ds.io/ 
                    --ensRegistry ${ensRegistry.address} 
                    --ensResolver ${publicResolver.address} 
                    --erc3668Resolver ${erc3668Resolver.address}`,
                );

                const balanceAfter = await provider.getBalance(
                    underfundedWallet.address,
                );

                expect(balanceAfter._hex).to.equal(balanceBefore._hex);
                expect(res.stderr).to.include(
                    'has insufficient funds to send 7 transactions with total cost of',
                );
            });
        });
    });
    describe('setup onChain', () => {
        describe('sanitize input', () => {
            it('reverts for unknown input', async () => {
                const res = await cli('dm3 setup onchainDs --efeh');
                expect(res.stderr).to.equal("error: unknown option '--efeh'");
            });

            it('reverts if rpc url is undefined', async () => {
                const wallet = ethers.Wallet.createRandom();
                const res = await cli(
                    `dm3 setup onchainDs --pk ${wallet.privateKey} --domain test.eth`,
                );
                expect(res.stderr).to.equal(
                    'error: option --rpc <rpc> argument missing',
                );
            });

            it('reverts if privateKey is undefined', async () => {
                const res = await cli(
                    'dm3 setup onchainDs --rpc www.rpc.io --domain test.eth',
                );
                expect(res.stderr).to.equal(
                    'error: option --pk <pk> argument missing',
                );
            });
            it('reverts if privateKey is invalid', async () => {
                const res = await cli(
                    'dm3 setup onchainDs --rpc www.rpc.io --domain test.eth --pk 123',
                );
                expect(res.stderr).to.equal(
                    'error: option --pk <pk> argument invalid',
                );
            });
            it('reverts if domain is undefined', async () => {
                const wallet = ethers.Wallet.createRandom();
                const res = await cli(
                    `dm3 setup onchainDs --rpc www.rpc.io --pk ${wallet.privateKey}`,
                );
                expect(res.stderr).to.equal(
                    'error: option --domain <domain> argument missing',
                );
            });
        });
        describe('setup onchainDsAll', () => {
            it('test all', async () => {
                const owner = ethers.Wallet.createRandom();

                const res = await cli(
                    `dm3 setup onchainDs 
                    --rpc  http://127.0.0.1:8545
                    --pk ${alice.privateKey} 
                    --domain alice.eth 
                    --deliveryService https://ds.io/ 
                    --profilePk ${owner.privateKey} 
                    --ensResolver ${publicResolver.address} 
                   `,
                );

                const profile = await publicResolver.text(
                    ethers.utils.namehash('alice.eth'),
                    'network.dm3.deliveryService',
                );
                expect(JSON.parse(profile).url).to.equal('https://ds.io/');

                const encryptionKeyPair = await createKeyPair(
                    await createStorageKey(owner.privateKey),
                );
                const signingKeyPair = await createSigningKeyPair(
                    await createStorageKey(owner.privateKey),
                );

                expect(JSON.parse(profile).publicEncryptionKey).to.equal(
                    encryptionKeyPair.publicKey,
                );
                expect(JSON.parse(profile).publicSigningKey).to.equal(
                    signingKeyPair.publicKey,
                );
            });
            it('test all with random profile wallet', async () => {
                const res = await cli(
                    `dm3 setup onchainDs 
                    --rpc  http://127.0.0.1:8545
                    --pk ${alice.privateKey} 
                    --domain alice.eth 
                    --deliveryService https://ds.io/  
                    --ensResolver ${publicResolver.address} 
                   `,
                );

                const profile = await publicResolver.text(
                    ethers.utils.namehash('alice.eth'),
                    'network.dm3.deliveryService',
                );
                expect(JSON.parse(profile).url).to.equal('https://ds.io/');

                expect(JSON.parse(profile).publicEncryptionKey).to.not.be
                    .undefined;
                expect(JSON.parse(profile).publicSigningKey).to.not.be
                    .undefined;
            });
            it('rejects with underfunded balance', async () => {
                const provider = new ethers.providers.JsonRpcProvider(
                    'http://127.0.0.1:8545/',
                );

                const underfundedWallet = ethers.Wallet.createRandom();
                //Send a little bit of ETH to the wallet. Although its to little to pay for the transactions
                await owner.connect(provider).sendTransaction({
                    to: underfundedWallet.address,
                    value: ethers.utils.parseEther('0.0001'),
                });
                const balanceBefore = await provider.getBalance(
                    underfundedWallet.address,
                );

                const res = await cli(
                    `dm3 setup onchainDs 
                    --rpc  http://127.0.0.1:8545
                    --pk ${underfundedWallet.privateKey} 
                    --domain alice.eth 
                    --deliveryService https://ds.io/ 
                    --ensResolver ${publicResolver.address} 
                   `,
                );

                const balanceAfter = await provider.getBalance(
                    underfundedWallet.address,
                );

                expect(balanceAfter._hex).to.equal(balanceBefore._hex);
                expect(res.stderr).to.include(
                    'has insufficient funds to send 1 transactions with total cost of',
                );
            });
        });
    });
});
