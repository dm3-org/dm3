import { expect } from 'chai';
import { ethers } from 'hardhat';
import {
    TestTopLevelAliasRegistry,
    TestTopLevelAliasRegistry__factory,
} from '../typechain';

describe('TestTopLevelAliasRegistry', function () {
    let testRegistry: TestTopLevelAliasRegistry;
    let owner: Signer;

    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        const TestRegistry = (await ethers.getContractFactory(
            'TestTopLevelAliasRegistry',
        )) as TestTopLevelAliasRegistry__factory;
        testRegistry = await TestRegistry.deploy(await owner.getAddress());
    });

    describe('_endsWith Function', function () {
        it('should return true if the string ends with the specified suffix', async function () {
            expect(
                await testRegistry.testEndsWith('hello.eth', '.eth'),
            ).to.equal(true);
        });

        it('should return true if the string ends with the specified suffix with subdomain', async function () {
            expect(
                await testRegistry.testEndsWith('hello.test.eth', '.eth'),
            ).to.equal(true);
        });

        it('should return false if the string does not end with the specified suffix', async function () {
            expect(
                await testRegistry.testEndsWith('hello.eth', '.com'),
            ).to.equal(false);
        });

        it('should return false if the string does not end with the specified suffix with subdomain', async function () {
            expect(
                await testRegistry.testEndsWith('hello.com.eth', '.com'),
            ).to.equal(false);
        });

        // Weitere Tests für die _endsWith Funktion
    });

    // Weitere Tests nach Bedarf
});
