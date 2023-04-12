import {
    BaseProvider,
    BlockTag,
    Network,
    TransactionRequest,
} from '@ethersproject/providers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import bodyParser from 'body-parser';
import * as Lib from 'dm3-lib/dist.backend';
import { BytesLike, Contract, ethers } from 'ethers';
import { fetchJson, FetchJsonResponse, hexlify } from 'ethers/lib/utils';
import express from 'express';
import { ethers as hreEthers } from 'hardhat';
import request from 'supertest';
import winston from 'winston';
import { OffchainResolver } from '../../typechain';
import { getDatabase, getRedisClient, Redis } from '../persistance/getDatabase';
import { IDatabase } from '../persistance/IDatabase';
import { ccipGateway } from './ccipGateway';
import { profile } from './profile';
const { expect } = require('chai');

describe('CCIP Gateway', () => {
    let redisClient: Redis;
    let db: IDatabase;
    let ccipApp: express.Express;
    let profileApp: express.Express;

    let offchainResolver: OffchainResolver;

    let signer: SignerWithAddress;
    let dm3User: SignerWithAddress;

    const logger = winston.createLogger({
        transports: [new winston.transports.Console()],
    });

    beforeEach(async () => {
        //Get signers
        [signer, dm3User] = await hreEthers.getSigners();

        //Create ResolverContract
        const OffchainResolver = await hreEthers.getContractFactory(
            'OffchainResolver',
        );
        offchainResolver = await OffchainResolver.deploy(
            'http://localhost:8080/{sender}/{data}',
            signer.address,
            [signer.address],
        );

        redisClient = await getRedisClient(logger);
        db = await getDatabase(logger, redisClient);
        await redisClient.flushDb();

        ccipApp = express();
        ccipApp.use(bodyParser.json());
        ccipApp.use(ccipGateway(signer, offchainResolver.address));

        ccipApp.locals.db = db;
        ccipApp.locals.logger = {
            // eslint-disable-next-line no-console
            info: (msg: string) => console.log(msg),
            // eslint-disable-next-line no-console
            warn: (msg: string) => console.log(msg),
        };

        profileApp = express();
        profileApp.use(bodyParser.json());

        profileApp.locals.forTests = await getSignedUserProfile();

        const provider: ethers.providers.JsonRpcProvider = new Proxy(
            hreEthers.provider,
            {
                get(target, prop) {
                    const resolveName = async () =>
                        profileApp.locals.forTests.signer;
                    return prop === 'resolveName' ? resolveName : target[prop];
                },
            },
        );

        profileApp.use(profile(provider));

        profileApp.locals.db = db;
        profileApp.locals.config = { spamProtection: true };
    });

    afterEach(async () => {
        await redisClient.flushDb();
        await redisClient.disconnect();
    });

    describe('Get UserProfile Offchain', () => {
        describe('ResolveText', () => {
            it('Returns valid Offchain profile', async () => {
                const { signature, profile, signer } =
                    profileApp.locals.forTests;

                await dm3User.sendTransaction({
                    to: signer,
                    value: hreEthers.BigNumber.from(1),
                });

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
                //Call the contract to retrieve the gateway url
                const { callData, sender } = await resolveGateWayUrl(
                    name,
                    offchainResolver,
                );

                //You the url returned by he contract to fetch the profile from the ccip gateway
                const { body, status } = await request(ccipApp)
                    .get(`/${sender}/${callData}`)
                    .send();

                expect(status).to.equal(200);

                const resultString = await offchainResolver.resolveWithProof(
                    body.data,
                    callData,
                );

                const [actualProfile] =
                    getResolverInterface().decodeFunctionResult(
                        'text',
                        resultString,
                    );

                expect(actualProfile).to.eql(
                    'data:application/json,' +
                        Lib.stringify({
                            profile,
                            signature,
                        }),
                );
            });

            it('Returns 404 if profile does not exists', async () => {
                const name = 'foo.dm3.eth';

                //Call the contract to retrieve the gateway url
                const { callData, sender } = await resolveGateWayUrl(
                    name,
                    offchainResolver,
                );

                //You the url returned by he contract to fetch the profile from the ccip gateway
                const { body, status } = await request(ccipApp)
                    .get(`/${sender}/${callData}`)
                    .send();

                expect(status).to.equal(404);
            });

            it('Returns 400 if record is not network.dm3.profile', async () => {
                //Call the contract to retrieve the gateway url
                const resolveGatewayUrlForTheWrongRecord = async () => {
                    try {
                        const textData =
                            getResolverInterface().encodeFunctionData('text', [
                                ethers.utils.namehash('foo.dm3.eth'),
                                'unknown.record',
                            ]);

                        //This always revers and throws the OffchainLookup Exceptions hence we need to catch it
                        await offchainResolver.resolve(
                            Lib.offchainResolver.encodeEnsName('foo.dm3.eth'),
                            textData,
                        );
                        return {
                            gatewayUrl: '',
                            callbackFunction: '',
                            extraData: '',
                        };
                    } catch (err: any) {
                        const { sender, urls, callData } = err.errorArgs;
                        //Decode call

                        //Replace template vars
                        const gatewayUrl = urls[0]
                            .replace('{sender}', sender)
                            .replace('{data}', callData);

                        return { gatewayUrl, sender, callData };
                    }
                };
                const { sender, callData } =
                    await resolveGatewayUrlForTheWrongRecord();

                //You the url returned by he contract to fetch the profile from the ccip gateway
                const { status } = await request(ccipApp).get(
                    `/${sender}/${callData}`,
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

    describe('E2e test', () => {
        describe('resolveText', () => {
            it('resolves propfile using ethers.provider.getText()', async () => {
                const { signer, profile, signature } =
                    profileApp.locals.forTests;
                await dm3User.sendTransaction({
                    to: signer,
                    value: hreEthers.BigNumber.from(1),
                });

                const name = 'foo.dm3.eth';

                //Create the profile in the first place
                const writeRes = await request(profileApp).post(`/name`).send({
                    name,
                    address: signer,
                    signedUserProfile: {
                        profile,
                        signature,
                    },
                });
                expect(writeRes.status).to.equal(200);

                const provider = new MockProvider(
                    hreEthers.provider,
                    fetchProfileFromCcipGateway,
                    offchainResolver,
                );

                const resolver = await provider.getResolver('foo.dm3.eth');

                const text = await resolver.getText(
                    Lib.profile.PROFILE_RECORD_NAME,
                );

                expect(text).to.eql(
                    'data:application/json,' +
                        Lib.stringify({ signature, profile }),
                );
            });
            it('Throws error if lookup went wrong', async () => {
                const provider = new MockProvider(
                    hreEthers.provider,
                    fetchProfileFromCcipGateway,
                    offchainResolver,
                );

                const resolver = await provider.getResolver('foo.dm3.eth');

                expect(resolver.getText('unknown record')).rejected;
            });
        });
        describe('ResolveAddr', () => {
            it('resolvesName returns the Address of the name', async () => {
                const { signer, profile, signature } =
                    profileApp.locals.forTests;
                await dm3User.sendTransaction({
                    to: signer,
                    value: hreEthers.BigNumber.from(1),
                });

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

                const provider = new MockProvider(
                    hreEthers.provider,
                    fetchProfileFromCcipGateway,
                    offchainResolver,
                );

                await provider.resolveName('foo.dm3.eth');
            });
        });
    });
    const fetchProfileFromCcipGateway = async (url: string, json?: string) => {
        const [sender, data] = url.split('/').slice(3);

        const response = await request(ccipApp)
            .get(`/${sender}/${data}`)
            .send();

        return response;
    };

    type Fetch = (
        url: string,
        json?: string,
        processFunc?: (value: any, response: FetchJsonResponse) => any,
    ) => Promise<any>;
    class MockProvider extends BaseProvider {
        readonly parent: BaseProvider;
        readonly fetcher: Fetch;
        readonly offchainResolver: OffchainResolver;

        /**
         * Constructor.
         * @param provider: The Ethers provider to wrap.
         */
        constructor(
            provider: BaseProvider,
            fetcher: Fetch = fetchJson,
            offchainResolver: OffchainResolver,
        ) {
            super(31337);
            this.parent = provider;
            this.fetcher = fetcher;
            this.offchainResolver = offchainResolver;
        }
        async getResolver(name: string) {
            return new ethers.providers.Resolver(
                this,
                offchainResolver.address,
                name,
            ) as any;
        }

        async perform(method: string, params: any): Promise<any> {
            switch (method) {
                case 'call':
                    const { result } = await this.handleCall(this, params);
                    return result;
                default:
                    return this.parent.perform(method, params);
            }
        }

        async handleCall(
            provider: MockProvider,
            params: { transaction: TransactionRequest; blockTag?: BlockTag },
        ): Promise<{ transaction: TransactionRequest; result: BytesLike }> {
            const fnSig = params.transaction.data!.toString().substring(0, 10);

            const rawResult = await provider.parent.perform('call', params);

            if (fnSig !== '0x9061b923') {
                const result = offchainResolver.interface.encodeFunctionResult(
                    fnSig,
                    [rawResult],
                );

                return {
                    transaction: params.transaction,
                    result,
                };
            }

            const { urls, callData } =
                offchainResolver.interface.decodeErrorResult(
                    'OffchainLookup',
                    rawResult,
                );

            const response = await this.sendRPC(
                provider.fetcher,
                urls,
                params.transaction.to,
                callData,
            );
            return {
                transaction: params.transaction,
                result: response,
            };
        }

        async sendRPC(
            fetcher: Fetch,
            urls: string[],
            to: any,
            callData: BytesLike,
        ): Promise<BytesLike> {
            const processFunc = (value: any, response: FetchJsonResponse) => {
                return { body: value, status: response.statusCode };
            };

            const args = { sender: hexlify(to), data: hexlify(callData) };
            const template = urls[0];
            const url = template.replace(
                /\{([^}]*)\}/g,
                (_match, p1: keyof typeof args) => args[p1],
            );
            const data = await fetcher(
                url,
                template.includes('{data}') ? undefined : JSON.stringify(args),
                processFunc,
            );
            if (data.status === 200) {
                return data.body.data;
            }

            return data.body.message;
        }

        detectNetwork(): Promise<Network> {
            return this.parent.detectNetwork();
        }
    }
});

const getSignedUserProfile = async (
    overwriteProfile?: Lib.profile.UserProfile,
) => {
    const profile: Lib.profile.UserProfile = overwriteProfile ?? {
        publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
        publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
        deliveryServices: [''],
    };

    const wallet = ethers.Wallet.createRandom();

    const createUserProfileMessage = Lib.profile.getProfileCreationMessage(
        Lib.stringify(profile),
    );
    const signature = await wallet.signMessage(createUserProfileMessage);

    const signer = wallet.address;

    return { signature, profile, signer };
};

function getResolverInterface() {
    return new ethers.utils.Interface([
        'function resolve(bytes calldata name, bytes calldata data) external view returns(bytes)',
        'function text(bytes32 node, string calldata key) external view returns (string memory)',
    ]);
}
const resolveGateWayUrl = async (
    ensName: string,
    offchainResolver: Contract,
) => {
    try {
        const textData = getResolverInterface().encodeFunctionData('text', [
            ethers.utils.namehash(ensName),
            Lib.profile.PROFILE_RECORD_NAME,
        ]);

        //This always revers and throws the OffchainLookup Exceptions hence we need to catch it
        await offchainResolver.resolve(
            Lib.offchainResolver.encodeEnsName(ensName),
            textData,
        );
        return { gatewayUrl: '', callbackFunction: '', extraData: '' };
    } catch (err: any) {
        const { sender, urls, callData } = err.errorArgs;
        //Decode call

        //Replace template vars
        const gatewayUrl = urls[0]
            .replace('{sender}', sender)
            .replace('{data}', callData);

        return { gatewayUrl, sender, callData };
    }
};
