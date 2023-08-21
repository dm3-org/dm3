import bodyParser from 'body-parser';
import { stringify } from 'dm3-lib-shared/dist.backend';
import { ethers } from 'ethers';
import express from 'express';
import request from 'supertest';
import winston from 'winston';
import { getDatabase, getDbClient } from '../persistance/getDatabase';
import { IDatabase } from '../persistance/IDatabase';
import { profile } from './profile';
import {
    UserProfile,
    getProfileCreationMessage,
} from 'dm3-lib-profile/dist.backend';
import { Interceptor } from './handleCcipRequest/handler/intercept';
import { PrismaClient } from '@prisma/client';
import { clearDb } from '../persistance/clearDb';
import { resolverEndpoint } from './resolverEndpoint';
import { expect } from 'chai';
import { encodeEnsName } from './handleCcipRequest/dns/encodeEnsName';

describe('Resolver Endpoint', () => {
    let prismaClient: PrismaClient;

    let db: IDatabase;
    let ccipApp: express.Express;
    let profileApp: express.Express;

    const logger = winston.createLogger({
        transports: [new winston.transports.Console()],
    });

    beforeEach(async () => {
        prismaClient = await getDbClient(logger);
        db = await getDatabase(logger, prismaClient);
        await clearDb(prismaClient);
        ccipApp = express();
        ccipApp.use(bodyParser.json());
        ccipApp.locals.db = db;
        ccipApp.locals.logger = {
            // eslint-disable-next-line no-console
            info: (msg: string) => console.log(msg),
            // eslint-disable-next-line no-console
            warn: (msg: string) => console.log(msg),
        };

        ccipApp.use(resolverEndpoint());
        profileApp = express();
        profileApp.use(bodyParser.json());
        profileApp.locals.forTests = await getSignedUserProfile();
        const provider: any = {
            getBalance: async () => ethers.BigNumber.from(1),
            resolveName: async () => profileApp.locals.forTests.signer,
        };

        profileApp.use(profile(provider));
        profileApp.locals.db = db;
        profileApp.locals.config = { spamProtection: true };
    });

    afterEach(async () => {
        await clearDb(prismaClient);
        prismaClient.$disconnect();
    });

    describe('Interceptor', () => {
        afterEach(() => {
            process.env.interceptor = '';
        });

        it('resolvesName returns the Address from the interceptor', async () => {
            const interceptor: Interceptor = {
                ensName: 'test.eth',
                addr: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            };

            const ensName = 'foo.test.eth';

            process.env.interceptor = JSON.stringify(interceptor);

            // the inner call requesting the address for the ENS name foo.test.eth
            const innerCall = getResolverInterface().encodeFunctionData(
                'addr',
                [ethers.utils.namehash(ensName)],
            );

            // the outer resolve() call
            const outerCall = getResolverInterface().encodeFunctionData(
                'resolve',
                [encodeEnsName(ensName), innerCall],
            );
            const { body, status } = await request(ccipApp)
                .get(`/${ethers.constants.AddressZero}/${outerCall}`)
                .send();

            expect(status).to.equal(200);
            expect(body.response).to.equal(
                '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            );
        });

        it('Returns profile from the interceptor', async () => {
            const interceptor: Interceptor = {
                ensName: 'test.eth',
                textRecords: {
                    test: 'test',
                },
            };
            process.env.interceptor = JSON.stringify(interceptor);

            const ensName = 'foo.test.eth';

            process.env.interceptor = JSON.stringify(interceptor);

            // the inner call requesting the test text record for the ENS name foo.test.eth
            const innerCall = getResolverInterface().encodeFunctionData(
                'text',
                [ethers.utils.namehash(ensName), 'test'],
            );

            // the outer resolve() call
            const outerCall = getResolverInterface().encodeFunctionData(
                'resolve',
                [encodeEnsName(ensName), innerCall],
            );
            const { body, status } = await request(ccipApp)
                .get(`/${ethers.constants.AddressZero}/${outerCall}`)
                .send();

            expect(status).to.equal(200);
            expect(body.response).to.equal('test');
        });
    });

    describe('Get UserProfile Offchain', () => {
        describe('ResolveText', () => {
            it('Returns valid Offchain profile', async () => {
                const { signature, profile, signer } =
                    profileApp.locals.forTests;

                const name = 'foo.dm3.eth';

                //Create the profile in the first place
                const writeRes = await request(profileApp)
                    .post(`/name`)
                    .send({
                        name,
                        ensName: signer + '.addr.dm3.eth',
                        address: signer,
                        signedUserProfile: {
                            profile,
                            signature,
                        },
                    });

                expect(writeRes.status).to.equal(200);
                // the inner call requesting the network.dm3.profile text record
                // for the ENS name foo.test.eth
                const innerCall = getResolverInterface().encodeFunctionData(
                    'text',
                    [ethers.utils.namehash(name), 'network.dm3.profile'],
                );

                // the outer resolve() call
                const outerCall = getResolverInterface().encodeFunctionData(
                    'resolve',
                    [encodeEnsName(name), innerCall],
                );
                const { body, status } = await request(ccipApp)
                    .get(`/${ethers.constants.AddressZero}/${outerCall}`)
                    .send();

                expect(status).to.equal(200);
                expect(body.response).to.equal(
                    'data:application/json,' +
                        stringify({
                            profile,
                            signature,
                        }),
                );
            });

            it('Returns 404 if profile does not exists', async () => {
                const name = 'foo.dm3.eth';
                // the inner call requesting the network.dm3.profile text record
                // for the ENS name foo.test.eth
                const innerCall = getResolverInterface().encodeFunctionData(
                    'text',
                    [ethers.utils.namehash(name), 'network.dm3.profile'],
                );

                // the outer resolve() call
                const outerCall = getResolverInterface().encodeFunctionData(
                    'resolve',
                    [encodeEnsName(name), innerCall],
                );

                //You the url returned by he contract to fetch the profile from the ccip gateway
                const { status } = await request(ccipApp)
                    .get(`/${ethers.constants.AddressZero}/${outerCall}`)
                    .send();

                expect(status).to.equal(404);
            });

            it('Returns 400 if record is not network.dm3.profile', async () => {
                const name = 'foo.dm3.eth';
                // the inner call requesting the network.dm3.unknown text record
                // for the ENS name foo.test.eth
                const innerCall = getResolverInterface().encodeFunctionData(
                    'text',
                    [ethers.utils.namehash(name), 'network.dm3.unknown'],
                );

                // the outer resolve() call
                const outerCall = getResolverInterface().encodeFunctionData(
                    'resolve',
                    [encodeEnsName(name), innerCall],
                );

                //You the url returned by he contract to fetch the profile from the ccip gateway
                const { status } = await request(ccipApp).get(
                    `/${ethers.constants.AddressZero}/${outerCall}`,
                );

                expect(status).to.equal(400);
            });

            it('Returns 400 if something failed during the request', async () => {
                //You the url returned by he contract to fetch the profile from the ccip gateway
                const { body, status } = await request(ccipApp)
                    .get(`/foo/bar`)
                    .send();

                expect(status).to.equal(400);
                expect(body.message).to.equal('Unknown error');
            });
        });
    });

    // TODO: move to integration test package
    // describe('E2e test', () => {
    //     describe('resolveText', () => {
    //         it('resolves propfile using ethers.provider.getText()', async () => {
    //             const { signer, profile, signature } =
    //                 profileApp.locals.forTests;
    //             await dm3User.sendTransaction({
    //                 to: signer,
    //                 value: hreEthers.BigNumber.from(1),
    //             });

    //             const name = 'foo.dm3.eth';

    //             //Create the profile in the first place
    //             const writeRes = await request(profileApp).post(`/name`).send({
    //                 name,
    //                 address: signer,
    //                 signedUserProfile: {
    //                     profile,
    //                     signature,
    //                 },
    //             });
    //             expect(writeRes.status).to.equal(200);

    //             const provider = new MockProvider(
    //                 hreEthers.provider,
    //                 fetchProfileFromCcipGateway,
    //                 offchainResolver,
    //             );

    //             const resolver = await provider.getResolver('foo.dm3.eth');

    //             const text = await resolver.getText(PROFILE_RECORD_NAME);

    //             expect(text).to.eql(
    //                 'data:application/json,' +
    //                     stringify({ signature, profile }),
    //             );
    //         });
    //         it('Throws error if lookup went wrong', async () => {
    //             const provider = new MockProvider(
    //                 hreEthers.provider,
    //                 fetchProfileFromCcipGateway,
    //                 offchainResolver,
    //             );

    //             const resolver = await provider.getResolver('foo.dm3.eth');

    //             expect(resolver.getText('unknown record')).rejected;
    //         });
    //     });
    //     describe('ResolveAddr', () => {
    //         it('resolvesName returns the Address of the name', async () => {
    //             const { signer, profile, signature } =
    //                 profileApp.locals.forTests;
    //             await dm3User.sendTransaction({
    //                 to: signer,
    //                 value: hreEthers.BigNumber.from(1),
    //             });

    //             const name = 'foo.dm3.eth';

    //             //Create the profile in the first place
    //             const writeRes = await request(profileApp)
    //                 .post(`/name`)
    //                 .send({
    //                     name,
    //                     ensName: signer + '.addr.dm3.eth',
    //                     address: signer,
    //                     signedUserProfile: {
    //                         profile,
    //                         signature,
    //                     },
    //                 });
    //             expect(writeRes.status).to.equal(200);

    //             const provider = new MockProvider(
    //                 hreEthers.provider,
    //                 fetchProfileFromCcipGateway,
    //                 offchainResolver,
    //             );

    //             await provider.resolveName('foo.dm3.eth');
    //         });
    //     });
    // });
    // const fetchProfileFromCcipGateway = async (url: string, json?: string) => {
    //     const [sender, data] = url.split('/').slice(3);

    //     const response = await request(ccipApp)
    //         .get(`/${sender}/${data}`)
    //         .send();

    //     return response;
    // };
});

const getSignedUserProfile = async (overwriteProfile?: UserProfile) => {
    const profile: UserProfile = overwriteProfile ?? {
        publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
        publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
        deliveryServices: [''],
    };

    const wallet = ethers.Wallet.createRandom();

    const createUserProfileMessage = getProfileCreationMessage(
        stringify(profile),
    );
    const signature = await wallet.signMessage(createUserProfileMessage);

    const signer = wallet.address;

    return { signature, profile, signer };
};

function getResolverInterface() {
    return new ethers.utils.Interface([
        'function resolve(bytes calldata name, bytes calldata data) external view returns(bytes)',
        'function text(bytes32 node, string calldata key) external view returns (string memory)',
        'function addr(bytes32 node) public view returns (address payable)',
    ]);
}