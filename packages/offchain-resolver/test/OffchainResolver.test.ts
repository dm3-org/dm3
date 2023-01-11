const { expect } = require('chai');
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers as hreEthers } from 'hardhat';
import { OffchainResolver__factory } from '../typechain';

describe('OffchainResolver', () => {
    let owner: SignerWithAddress;
    let signer: SignerWithAddress;
    let rando: SignerWithAddress;

    let offchainResolverFactory: OffchainResolver__factory;

    beforeEach(async () => {
        //Get signers
        [owner, signer, rando] = await hreEthers.getSigners();

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
                [signer.address],
            );

            const actualOwner = await offchainResolver.owner();
            const actualUrl = await offchainResolver.url();
            const actualSigner = await offchainResolver.signers(signer.address);

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
                [signer.address],
            );

            const actualOwner = await offchainResolver.owner();
            expect(actualOwner).to.equal(owner.address);

            const setNewOwnerTx = await offchainResolver.setOwner(
                signer.address,
            );

            const receipt = await setNewOwnerTx.wait();

            const newOwner = await offchainResolver.owner();
            expect(newOwner).to.equal(signer.address);

            const [newOwnerEvent] = receipt.events!;
            const decodedEvent = newOwnerEvent.decode!(newOwnerEvent.data);

            expect(decodedEvent[0]).to.equal(signer.address);
        });
        it("Rando can't set a new owner ", async () => {
            const offchainResolver = await offchainResolverFactory.deploy(
                'http://localhost:8080/{sender}/{data}',
                owner.address,
                [signer.address],
            );

            const actualOwner = await offchainResolver.owner();
            expect(actualOwner).to.equal(owner.address);

            await expect(
                offchainResolver.connect(rando).setOwner(rando.address),
            ).to.be.revertedWith('only owner');
        });
    });
});
