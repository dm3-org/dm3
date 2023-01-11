import {
    BaseProvider,
    TransactionRequest,
    BlockTag,
    Network,
} from '@ethersproject/providers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import bodyParser from 'body-parser';
import * as Lib from 'dm3-lib/dist.backend';
import { BytesLike, Contract, ethers } from 'ethers';
import {
    fetchJson,
    arrayify,
    FetchJsonResponse,
    hexlify,
} from 'ethers/lib/utils';
import express from 'express';
import { ethers as hreEthers } from 'hardhat';
import request from 'supertest';
import { OffchainResolver, OffchainResolver__factory } from '../../typechain';
import { getDatabase, getRedisClient, Redis } from '../persistance/getDatabase';
import { IDatabase } from '../persistance/IDatabase';
import { ccipGateway } from './ccipGateway';

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';

describe('CCIP Gateway', () => {
    let redisClient: Redis;
    let db: IDatabase;
    let app: express.Express;

    let offchainResolver: OffchainResolver;

    let signer: SignerWithAddress;
    let dm3User: SignerWithAddress;

    beforeEach(async () => {
        //Get signers
        [signer, dm3User] = await hreEthers.getSigners();

        //Create ResolverContract
        const OffchainResolver = await hreEthers.getContractFactory(
            'OffchainResolver',
        );
        offchainResolver = await OffchainResolver.deploy(
            'http://localhost:8080/{sender}/{data}',
            [signer.address],
        );

        redisClient = await getRedisClient();
        db = await getDatabase(redisClient);
        await redisClient.flushDb();

        app = express();
        app.use(bodyParser.json());
        app.use(ccipGateway(signer, offchainResolver.address));

        app.locals.db = db;
    });

    afterEach(async () => {
        await redisClient.flushDb();
        await redisClient.disconnect();
    });
    describe('Store UserProfile Offchain', () => {
        it('Rejects invalid schema', async () => {
            const { status, body } = await request(app).post(`/`).send({
                name: 'foo.dm3.eth',
                address: SENDER_ADDRESS,
                signedUserProfile: {},
            });

            expect(status).toBe(400);
            expect(body.error).toBe('invalid schema');
        });
        it('Rejects invalid profile', async () => {
            const profile: Lib.account.UserProfile = {
                publicSigningKey:
                    '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
                publicEncryptionKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                deliveryServices: [''],
            };

            const wallet = ethers.Wallet.createRandom();

            const signature = await wallet.signMessage('foo');

            const { status, body } = await request(app).post(`/`).send({
                name: 'foo.dm3.eth',
                address: wallet.address,
                signedUserProfile: {
                    profile,
                    signature,
                },
            });

            expect(status).toBe(400);
            expect(body.error).toBe('invalid profile');
        });
        it('Rejects if subdomain has already a profile', async () => {
            const profile2: Lib.account.UserProfile = {
                publicSigningKey: '',
                publicEncryptionKey: '',
                deliveryServices: [''],
            };

            const offChainProfile1 = await getSignedUserProfile();
            const offChainProfile2 = await getSignedUserProfile(profile2);

            const res1 = await request(app)
                .post(`/`)
                .send({
                    name: 'foo.dm3.eth',
                    address: offChainProfile1.signer,
                    signedUserProfile: {
                        signature: offChainProfile1.signature,
                        profile: offChainProfile1.profile,
                    },
                });

            expect(res1.status).toBe(200);

            const res2 = await request(app)
                .post(`/`)
                .send({
                    name: 'foo.dm3.eth',
                    address: offChainProfile2.signer,
                    signedUserProfile: {
                        signature: offChainProfile2.signature,
                        profile: offChainProfile2.profile,
                    },
                });

            expect(res2.status).toBe(400);
            expect(res2.body.error).toStrictEqual('subdomain already claimed');
        });
        it('Stores a valid profile', async () => {
            const { signer, profile, signature } = await getSignedUserProfile();
            const { status } = await request(app).post(`/`).send({
                name: 'foo.dm3.eth',
                address: signer,
                signedUserProfile: {
                    signature,
                    profile,
                },
            });

            expect(status).toBe(200);
        });
    });
    describe('Get UserProfile Offchain', () => {
        it('Returns valid Offchain profile', async () => {
            const { signer, profile, signature } = await getSignedUserProfile();

            const name = 'foo.dm3.eth';

            //Create the profile in the first place
            const writeRes = await request(app).post(`/`).send({
                name,
                address: signer,
                signedUserProfile: {
                    profile,
                    signature,
                },
            });

            expect(writeRes.status).toBe(200);
            //Call the contract to retrieve the gateway url
            const { callData, sender } = await resolveGateWayUrl(
                name,
                offchainResolver,
            );

            //You the url returned by he contract to fetch the profile from the ccip gateway
            const { body, status } = await request(app)
                .get(`/${sender}/${callData}`)
                .send();

            expect(status).toBe(200);

            const resultString = await offchainResolver.resolveWithProof(
                body.data,
                callData,
            );

            const [actualProfile] = getResolverInterface().decodeFunctionResult(
                'text',
                resultString,
            );

            expect(JSON.parse(actualProfile)).toStrictEqual(profile);
        });
        it('Returns 404 if profile does not exists', async () => {
            const { signer, profile, signature } = await getSignedUserProfile();

            const name = 'foo.dm3.eth';

            //Call the contract to retrieve the gateway url
            const { callData, sender } = await resolveGateWayUrl(
                name,
                offchainResolver,
            );

            //You the url returned by he contract to fetch the profile from the ccip gateway
            const { body, status } = await request(app)
                .get(`/${sender}/${callData}`)
                .send();

            expect(status).toBe(404);
        });
        it('Returns 400 if record is not dm3.profile', async () => {
            //Call the contract to retrieve the gateway url
            const resolveGatewayUrlForTheWrongRecord = async () => {
                try {
                    const textData = getResolverInterface().encodeFunctionData(
                        'text',
                        [
                            ethers.utils.namehash(
                                ethers.utils.nameprep('foo.dm3.eth'),
                            ),
                            'unknown.record',
                        ],
                    );

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
            const { status } = await request(app)
                .get(`/${sender}/${callData}`)
                .send();

            expect(status).toBe(400);
        });
        it('Returns 400 if something failed during the request', async () => {
            //You the url returned by he contract to fetch the profile from the ccip gateway
            const { body, status } = await request(app).get(`/foo/bar`).send();

            expect(status).toBe(400);
            expect(body.message).toBe('Unknown error');
        });
    });

    describe('E2e test', () => {
        it('resolves propfile using ethers.provider.getText()', async () => {
            const { signer, profile, signature } = await getSignedUserProfile();

            const name = 'foo.dm3.eth';

            //Create the profile in the first place
            const writeRes = await request(app).post(`/`).send({
                name,
                address: signer,
                signedUserProfile: {
                    profile,
                    signature,
                },
            });
            expect(writeRes.status).toBe(200);

            const provider = new MockProvider(
                hreEthers.provider,
                fetchProfileFromCcipGateway,
                offchainResolver,
            );

            const resolver = new ethers.providers.Resolver(
                provider,
                offchainResolver.address,
                'foo.dm3.eth',
            );

            const text = await resolver.getText('dm3.profile');

            expect(JSON.parse(text)).toStrictEqual(profile);
        });
        it('Throws error if lookup went wrong', async () => {
            const provider = new MockProvider(
                hreEthers.provider,
                fetchProfileFromCcipGateway,
                offchainResolver,
            );

            const resolver = new ethers.providers.Resolver(
                provider,
                offchainResolver.address,
                'foo.dm3.eth',
            );

            expect(
                async () => await resolver.getText('unknown record'),
            ).rejects.toThrowError();
        });
    });
    const fetchProfileFromCcipGateway = async (url: string, json?: string) => {
        const [sender, data] = url.split('/').slice(3);

        const response = await request(app).get(`/${sender}/${data}`).send();

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
    overwriteProfile?: Lib.account.UserProfile,
) => {
    const profile: Lib.account.UserProfile = overwriteProfile ?? {
        publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
        publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
        deliveryServices: [''],
    };

    const wallet = ethers.Wallet.createRandom();

    const createUserProfileMessage = Lib.account.getProfileCreationMessage(
        Lib.stringify(profile),
    );
    const signature = await wallet.signMessage(createUserProfileMessage);

    const signer = wallet.address;

    return { signature, profile, signer };
};

export function getResolverInterface() {
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
            ethers.utils.namehash(ethers.utils.nameprep(ensName)),
            'dm3.profile',
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
