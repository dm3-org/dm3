import { expect } from 'chai';
import { ethers } from 'hardhat';
import {
    TopLevelAliasRegistry,
    TopLevelAliasRegistry__factory,
} from '../typechain';

describe('TopLevelAliasRegistry', function () {
    let topLevelAliasRegistry: TopLevelAliasRegistry;
    let owner: Signer;
    let addr1: Signer;

    beforeEach(async function () {
        const factory = (await ethers.getContractFactory(
            'TopLevelAliasRegistry',
        )) as TopLevelAliasRegistry__factory;
        [owner, addr1] = await ethers.getSigners();
        topLevelAliasRegistry = (await factory.deploy(
            await owner.getAddress(),
        )) as TopLevelAliasRegistry;
    });

    describe('Deployment', function () {
        it('Should set the specified address as the owner', async function () {
            expect(await topLevelAliasRegistry.owner()).to.equal(
                await owner.getAddress(),
            );
        });
    });

    describe('Set and Get Alias', function () {
        it('Should let the owner set a valid alias and retrieve it', async function () {
            await topLevelAliasRegistry
                .connect(owner)
                .setAlias('alice', 'alice.eth');
            expect(await topLevelAliasRegistry.aliases('alice')).to.equal(
                'alice.eth',
            );
        });

        it('Should let the owner set a valid alias and retrieve it', async function () {
            await topLevelAliasRegistry
                .connect(owner)
                .setAlias('alice', 'abc.io');
            expect(await topLevelAliasRegistry.aliases('alice')).to.equal(
                'abc.io',
            );
        });

        it('Should let the owner set a valid long alias and retrieve it', async function () {
            await topLevelAliasRegistry
                .connect(owner)
                .setAlias('test', 'abc.long_name.xyz.eth');
            expect(await topLevelAliasRegistry.aliases('test')).to.equal(
                'abc.long_name.xyz.eth',
            );
        });

        it('Should prevent setting an alias that is too short or too long', async function () {
            await expect(
                topLevelAliasRegistry.connect(owner).setAlias('bob', 'bb.et'),
            ).to.be.revertedWith('Alias length is invalid');

            let longAlias = 'b'.repeat(47) + '.eth';
            await expect(
                topLevelAliasRegistry.connect(owner).setAlias('bob', longAlias),
            ).to.be.revertedWith('Alias length is invalid');
        });

        it('Should prevent setting an empty toplevel', async function () {
            await expect(
                topLevelAliasRegistry.connect(owner).setAlias('', 'valid.eth'),
            ).to.be.revertedWith('Toplevel cannot be empty');
        });

        it('Should revert if the alias starts with a dot', async function () {
            await expect(
                topLevelAliasRegistry
                    .connect(owner)
                    .setAlias('alice', '.alice.eth'),
            ).to.be.revertedWith('Alias must not start with a dot');
        });

        it('Should revert if the toplevel starts with a dot', async function () {
            await expect(
                topLevelAliasRegistry
                    .connect(owner)
                    .setAlias('.alice', 'alice.eth'),
            ).to.be.revertedWith('Toplevel must not start with a dot');
        });
    });

    describe('Set Alias Event', function () {
        it('Should emit an AliasSet event when a new alias is set', async function () {
            await expect(
                topLevelAliasRegistry
                    .connect(owner)
                    .setAlias('alice', 'alice.eth'),
            )
                .to.emit(topLevelAliasRegistry, 'AliasSet')
                .withArgs('alice', 'alice.eth');
        });
    });

    describe('existsAlias Function', function () {
        it('Should return true for an existing alias', async function () {
            const toplevel = 'alice';
            const alias = 'alice.eth';
            await topLevelAliasRegistry
                .connect(owner)
                .setAlias(toplevel, alias);
            expect(await topLevelAliasRegistry.existsAlias(toplevel)).to.be
                .true;
        });

        it('Should return false for a non-existing alias', async function () {
            const nonExistentToplevel = 'bob';
            expect(await topLevelAliasRegistry.existsAlias(nonExistentToplevel))
                .to.be.false;
        });
    });

    /* describe('TopLevelAliasRegistry Gas Usage', function () {
        it('should measure gas used by setAlias function', async function () {
            const tx = await topLevelAliasRegistry
                .connect(owner)
                .setAlias('.alice', '.alice.eth');
            const receipt = await tx.wait();
            console.log(`Gas used for setAlias: ${receipt.gasUsed.toString()}`);
        });
    });*/

    describe('Ownership', function () {
        it('Should set the correct owner at deployment', async function () {
            const currentOwner = await topLevelAliasRegistry.owner();
            expect(currentOwner).to.equal(await owner.getAddress());
        });

        it('Should allow owner to transfer ownership', async function () {
            const addr1Address = await addr1.getAddress();
            await topLevelAliasRegistry
                .connect(owner)
                .transferOwnership(addr1Address);
            expect(await topLevelAliasRegistry.owner()).to.equal(addr1Address);
        });

        it('Should prevent non-owners from transferring ownership', async function () {
            const addr1Address = await addr1.getAddress();
            await expect(
                topLevelAliasRegistry
                    .connect(addr1)
                    .transferOwnership(addr1Address),
            ).to.be.revertedWithCustomError(
                topLevelAliasRegistry,
                'OwnableUnauthorizedAccount',
            );
        });

        it('Should prevent non-owners from setting aliases', async function () {
            await expect(
                topLevelAliasRegistry
                    .connect(addr1)
                    .setAlias('testname', 'testname.eth'),
            ).to.be.revertedWithCustomError(
                topLevelAliasRegistry,
                'OwnableUnauthorizedAccount',
            );
        });
    });
});
