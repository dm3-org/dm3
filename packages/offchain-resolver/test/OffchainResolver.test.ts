const { expect } = require('chai');
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers as hreEthers } from 'hardhat';
import { OffchainResolver__factory } from '../typechain';

describe('OffchainResolver', () => {
    let owner: SignerWithAddress;
    let signer1: SignerWithAddress;
    let signer2: SignerWithAddress;
    let rando: SignerWithAddress;

    let offchainResolverFactory: OffchainResolver__factory;

    beforeEach(async () => {
        //Get signers
        [owner, signer1, signer2, rando] = await hreEthers.getSigners();

        //Create ResolverContract
        offchainResolverFactory = await hreEthers.getContractFactory(
            'OffchainResolver',
        );
    });

    describe('Constructor', () => {
        it('Initially set the owner,url and signers using the constructor ', async () => {
            const offchainResolver = await offchainResolverFactory.deploy(
                'http://localhost:8080/{sender}/{data}',
                owner.address,
                [signer1.address],
            );

            const actualOwner = await offchainResolver.owner();
            const actualUrl = await offchainResolver.url();
            const actualSigner = await offchainResolver.signers(
                signer1.address,
            );

            expect(actualOwner).to.equal(owner.address);
            expect(actualUrl).to.equal('http://localhost:8080/{sender}/{data}');

            expect(actualSigner).to.equal(true);
        });
    });

    describe('setOwner', () => {
        it('Owner can set a new Owner ', async () => {
            const offchainResolver = await offchainResolverFactory.deploy(
                'http://localhost:8080/{sender}/{data}',
                owner.address,
                [signer1.address],
            );

            const actualOwner = await offchainResolver.owner();
            expect(actualOwner).to.equal(owner.address);

            expect(await offchainResolver.setOwner(signer1.address))
                .to.emit(offchainResolver, 'NewOwner')
                .withArgs(signer1.address);

            const newOwner = await offchainResolver.owner();
            expect(newOwner).to.equal(signer1.address);
        });
        it("Rando can't set a new owner ", async () => {
            const offchainResolver = await offchainResolverFactory.deploy(
                'http://localhost:8080/{sender}/{data}',
                owner.address,
                [signer1.address],
            );

            const actualOwner = await offchainResolver.owner();
            expect(actualOwner).to.equal(owner.address);

            await expect(
                offchainResolver.connect(rando).setOwner(rando.address),
            ).to.be.revertedWith('only owner');
        });
    });

    describe('addSigners', () => {
        it('Owner can add new signers', async () => {
            const offchainResolver = await offchainResolverFactory.deploy(
                'http://localhost:8080/{sender}/{data}',
                owner.address,
                [],
            );

            await expect(
                offchainResolver.addSigners([signer1.address, signer2.address]),
            )
                .to.emit(offchainResolver, 'NewSigners')
                .withArgs([signer1.address, signer2.address]);

            const isSigner1Enabled = await offchainResolver.signers(
                signer1.address,
            );

            const isSigner2Enabled = await offchainResolver.signers(
                signer2.address,
            );

            expect(isSigner1Enabled && isSigner2Enabled).to.be.true;
        });
        it("Rando can't add new signers", async () => {
            const offchainResolver = await offchainResolverFactory.deploy(
                'http://localhost:8080/{sender}/{data}',
                owner.address,
                [],
            );

            await expect(
                offchainResolver
                    .connect(rando)
                    .addSigners([signer1.address, signer2.address]),
            ).to.be.revertedWith('only owner');
        });
    });

    describe('removeSigners', () => {
        it('Owner can remove signers', async () => {
            const offchainResolver = await offchainResolverFactory.deploy(
                'http://localhost:8080/{sender}/{data}',
                owner.address,
                [signer1.address],
            );

            const signerIsEnabled = await offchainResolver.signers(
                signer1.address,
            );
            expect(signerIsEnabled).to.be.true;

            await expect(offchainResolver.removeSigners([signer1.address]))
                .to.emit(offchainResolver, 'SignerRemoved')
                .withArgs(signer1.address);

            const signerIsStillEnabled = await offchainResolver.signers(
                signer1.address,
            );
            expect(signerIsStillEnabled).to.be.false;
        });
        it('Only remove signers that were already created before', async () => {
            const offchainResolver = await offchainResolverFactory.deploy(
                'http://localhost:8080/{sender}/{data}',
                owner.address,
                [signer1.address],
            );

            const signerIsEnabled = await offchainResolver.signers(
                signer1.address,
            );
            expect(signerIsEnabled).to.be.true;

            const tx = await offchainResolver.removeSigners([
                signer1.address,
                signer2.address,
            ]);

            const receipt = await tx.wait();

            const events = receipt.events!;
            //The contract should just have thrown only one event, despite beeing called with two args
            expect(events.length).to.equal(1);

            expect(events[0].decode!(events[0].data)[0]).to.equal(
                signer1.address,
            );

            const signerIsStillEnabled = await offchainResolver.signers(
                signer1.address,
            );
            expect(signerIsStillEnabled).to.be.false;
        });
        it("Rando can't remove signers", async () => {
            const offchainResolver = await offchainResolverFactory.deploy(
                'http://localhost:8080/{sender}/{data}',
                owner.address,
                [signer1.address],
            );

            const signerIsEnabled = await offchainResolver.signers(
                signer1.address,
            );
            expect(signerIsEnabled).to.be.true;

            await expect(
                offchainResolver
                    .connect(rando)
                    .removeSigners([signer1.address]),
            ).to.be.revertedWith('only owner');

            const signerIsStillEnabled = await offchainResolver.signers(
                signer1.address,
            );
            expect(signerIsStillEnabled).to.be.true;
        });
    });
});
