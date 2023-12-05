import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract, Signer } from 'ethers';
import { TopLevelAliasRegistry__factory } from '../typechain';
import { TopLevelAliasRegistry } from '../typechain/TopLevelAliasRegistry';

describe('TopLevelAliasRegistry', function () {
    let topLevelAliasRegistry: Contract;
    let owner: Signer;
    let addr1: Signer;
    let addr2: Signer;

    beforeEach(async function () {
        const TopLevelAliasRegistry = (await ethers.getContractFactory(
            'TopLevelAliasRegistry',
        )) as TopLevelAliasRegistry__factory;
        [owner, addr1, addr2] = await ethers.getSigners();
        topLevelAliasRegistry = await TopLevelAliasRegistry.deploy();
    });

    describe('Deployment', function () {
        it('Should set the right owner as admin', async function () {
            expect(
                await topLevelAliasRegistry.isAdmin(await owner.getAddress()),
            ).to.equal(true);
        });
    });

    describe('Set and Get Alias', function () {
        it('Should let the owner set a valid alias and retrieve it', async function () {
            const registry = topLevelAliasRegistry as TopLevelAliasRegistry;
            await registry.connect(owner).setAlias('Alice', 'alice.eth');
            expect(await registry.getAlias('Alice')).to.equal('alice.eth');
        });

        it("Should prevent setting an alias that does not end with '.eth'", async function () {
            const registry = topLevelAliasRegistry as TopLevelAliasRegistry;
            await expect(
                registry.connect(owner).setAlias('Bob', 'bob.xyz'),
            ).to.be.revertedWith("Alias must end with '.eth'");
        });

        it('Should prevent setting an alias that is too short or too long', async function () {
            const registry = topLevelAliasRegistry as TopLevelAliasRegistry;
            await expect(
                registry.connect(owner).setAlias('Bob', 'bo.eth'),
            ).to.be.revertedWith('Alias must be at least 7 characters long');

            let longAlias = 'b'.repeat(101) + '.eth';
            await expect(
                registry.connect(owner).setAlias('Bob', longAlias),
            ).to.be.revertedWith('Alias is too long');
        });

        it('Should prevent setting an empty name', async function () {
            const registry = topLevelAliasRegistry as TopLevelAliasRegistry;
            await expect(
                registry.connect(owner).setAlias('', 'valid.eth'),
            ).to.be.revertedWith('Name cannot be empty');
        });
    });

    describe('Admin Management', function () {
        it('Should allow owner to add a new admin', async function () {
            const registry = topLevelAliasRegistry as TopLevelAliasRegistry;
            await registry
                .connect(owner)
                .setAdminStatus(await addr1.getAddress(), true);
            expect(await registry.isAdmin(await addr1.getAddress())).to.equal(
                true,
            );
        });

        it('Should prevent non-admins from setting an alias', async function () {
            const registry = topLevelAliasRegistry as TopLevelAliasRegistry;
            await expect(
                registry.connect(addr1).setAlias('Charlie', 'charlie.eth'),
            ).to.be.revertedWith('Only an admin can perform this action');
        });

        it('Should prevent removing the last admin', async function () {
            const registry = topLevelAliasRegistry as TopLevelAliasRegistry;
            await expect(
                registry
                    .connect(owner)
                    .setAdminStatus(await owner.getAddress(), false),
            ).to.be.revertedWith('Cannot remove the last admin');
        });

        it('Should prevent adding a zero address as an admin', async function () {
            const registry = topLevelAliasRegistry as TopLevelAliasRegistry;
            await expect(
                registry
                    .connect(owner)
                    .setAdminStatus(
                        '0x0000000000000000000000000000000000000000',
                        true,
                    ),
            ).to.be.revertedWith('Invalid address');
        });
    });

    // ... (Any additional tests)
});
