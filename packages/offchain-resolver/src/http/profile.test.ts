import bodyParser from 'body-parser';
import express from 'express';
import { ethers as hreEthers } from 'hardhat';
import request from 'supertest';
import { getDatabase, getRedisClient, Redis } from '../persistance/getDatabase';
import { IDatabase } from '../persistance/IDatabase';
import { profile } from './profile';
import * as Lib from 'dm3-lib/dist.backend';
import { ethers } from 'ethers';
import winston from 'winston';
const { expect } = require('chai');
const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';

describe('Profile', () => {
    let redisClient: Redis;
    let db: IDatabase;
    let app: express.Express;

    const logger = winston.createLogger({
        transports: [new winston.transports.Console()],
    });

    beforeEach(async () => {
        redisClient = await getRedisClient(logger);
        db = await getDatabase(logger, redisClient);
        await redisClient.flushDb();

        app = express();
        app.use(bodyParser.json());
        app.locals.forTests = await getSignedUserProfile();
        const provider: ethers.providers.JsonRpcProvider = new Proxy(
            hreEthers.provider,
            {
                get(target, prop) {
                    const resolveName = async () => app.locals.forTests.signer;
                    return prop === 'resolveName' ? resolveName : target[prop];
                },
            },
        );

        app.use(profile(provider));
        app.locals.config = { spamProtection: true };
        app.locals.db = db;

        app.locals.logger = {
            // eslint-disable-next-line no-console
            info: (msg: string) => console.log(msg),
            // eslint-disable-next-line no-console
            warn: (msg: string) => console.log(msg),
        };
    });

    afterEach(async () => {
        await redisClient.flushDb();
        await redisClient.disconnect();
    });
    describe('Store UserProfile by ens name', () => {
        it('Rejects invalid schema', async () => {
            const { status, body } = await request(app).post(`/name`).send({
                name: 'foo.dm3.eth',
                address: SENDER_ADDRESS,
                signedUserProfile: {},
            });

            expect(status).to.equal(400);
            expect(body.error).to.equal('invalid schema');
        });
        it('Rejects invalid profile', async () => {
            const profile: Lib.account.UserProfile = {
                publicSigningKey:
                    '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
                publicEncryptionKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                deliveryServices: [''],
            };

            const wallet = hreEthers.Wallet.createRandom();

            const signature = await wallet.signMessage('foo');

            const { status, body } = await request(app).post(`/name`).send({
                name: 'foo.dm3.eth',
                address: wallet.address,
                signedUserProfile: {
                    profile,
                    signature,
                },
            });

            expect(status).to.equal(400);
            expect(body.error).to.equal('invalid profile');
        });

        it('Rejects address with an empty eth balance', async () => {
            const offChainProfile = app.locals.forTests;
            const { status, body } = await request(app)
                .post(`/name`)
                .send({
                    name: 'foo.dm3.eth',
                    address: offChainProfile.signer,
                    signedUserProfile: {
                        signature: offChainProfile.signature,
                        profile: offChainProfile.profile,
                    },
                });

            expect(status).to.equal(400);
            expect(body.error).to.equal('Insuficient ETH balance');
        });

        it('Rejects if subdomain has already a profile', async () => {
            const profile2: Lib.account.UserProfile = {
                publicSigningKey: '',
                publicEncryptionKey: '',
                deliveryServices: [''],
            };

            const offChainProfile1 = app.locals.forTests;

            //Fund wallets so their balance is not zero
            const [wale] = await hreEthers.getSigners();
            await wale.sendTransaction({
                to: offChainProfile1.signer,
                value: hreEthers.BigNumber.from(1),
            });

            const res1 = await request(app)
                .post(`/name`)
                .send({
                    name: 'foo.dm3.eth',
                    address: offChainProfile1.signer,
                    signedUserProfile: {
                        signature: offChainProfile1.signature,
                        profile: offChainProfile1.profile,
                    },
                });

            expect(res1.status).to.equal(200);

            app.locals.forTests = await getSignedUserProfile(profile2);
            const offChainProfile2 = app.locals.forTests;
            const provider: ethers.providers.JsonRpcProvider = new Proxy(
                hreEthers.provider,
                {
                    get(target, prop) {
                        const resolveName = async () =>
                            app.locals.forTests.signer;
                        return prop === 'resolveName'
                            ? resolveName
                            : target[prop];
                    },
                },
            );

            const app2 = express();
            app2.use(bodyParser.json());

            app2.use(profile(provider));
            app2.locals.config = { spamProtection: true };
            app2.locals.db = db;

            app2.locals.logger = {
                // eslint-disable-next-line no-console
                info: (msg: string) => console.log(msg),
                // eslint-disable-next-line no-console
                warn: (msg: string) => console.log(msg),
            };
            await wale.sendTransaction({
                to: offChainProfile2.signer,
                value: hreEthers.BigNumber.from(1),
            });

            const res2 = await request(app2)
                .post(`/name`)
                .send({
                    name: 'foo.dm3.eth',
                    address: offChainProfile2.signer,
                    signedUserProfile: {
                        signature: offChainProfile2.signature,
                        profile: offChainProfile2.profile,
                    },
                });

            expect(res2.status).to.equal(400);
            expect(res2.body.error).to.eql('subdomain already claimed');
        });
        it('Rejects if address already claimed a subdomain', async () => {
            const offChainProfile1 = app.locals.forTests;

            //Fund wallets so their balance is not zero
            const [wale] = await hreEthers.getSigners();
            await wale.sendTransaction({
                to: offChainProfile1.signer,
                value: hreEthers.BigNumber.from(1),
            });

            const res1 = await request(app)
                .post(`/name`)
                .send({
                    name: 'foo.dm3.eth',
                    address: offChainProfile1.signer,
                    ensName: offChainProfile1.signer + '.addr.dm3.eth',
                    signedUserProfile: {
                        signature: offChainProfile1.signature,
                        profile: offChainProfile1.profile,
                    },
                });

            expect(res1.status).to.equal(200);

            const res2 = await request(app)
                .post(`/name`)
                .send({
                    name: 'bar.dm3.eth',
                    address: offChainProfile1.signer,
                    signedUserProfile: {
                        signature: offChainProfile1.signature,
                        profile: offChainProfile1.profile,
                    },
                });

            expect(res2.status).to.equal(400);
            expect(res2.body.error).to.eql(
                'address has already claimed a subdomain',
            );
        });
        it('Rejects if name has the address format', async () => {
            const { signer, profile, signature } = app.locals.forTests;

            //Fund wallet so their balance is not zero
            const [wale] = await hreEthers.getSigners();
            await wale.sendTransaction({
                to: signer,
                value: hreEthers.BigNumber.from(1),
            });

            const { status, body } = await request(app).post(`/name`).send({
                name: signer,
                address: signer,
                signedUserProfile: {
                    signature,
                    profile,
                },
            });

            expect(status).to.equal(400);
            expect(body.error).to.equal('Invalid ENS name');
        });
        it('Stores a valid profile', async () => {
            const { signer, profile, signature } = app.locals.forTests;

            //Fund wallet so their balance is not zero
            const [wale] = await hreEthers.getSigners();
            await wale.sendTransaction({
                to: signer,
                value: hreEthers.BigNumber.from(1),
            });

            const { status } = await request(app).post(`/name`).send({
                name: 'foo.dm3.eth',
                address: signer,
                signedUserProfile: {
                    signature,
                    profile,
                },
            });

            expect(status).to.equal(200);
        });
    });
    describe('Store UserProfile by address', () => {
        it('Rejects invalid schema', async () => {
            const { status, body } = await request(app).post(`/address`).send({
                address: SENDER_ADDRESS,
                signedUserProfile: {},
            });

            expect(status).to.equal(400);
            expect(body.error).to.equal('invalid schema');
        });
        it('Rejects invalid profile', async () => {
            const profile: Lib.account.UserProfile = {
                publicSigningKey:
                    '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
                publicEncryptionKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                deliveryServices: [''],
            };

            const wallet = hreEthers.Wallet.createRandom();

            const signature = await wallet.signMessage('foo');

            const { status, body } = await request(app).post(`/address`).send({
                address: wallet.address,
                signedUserProfile: {
                    profile,
                    signature,
                },
            });

            expect(status).to.equal(400);
            expect(body.error).to.equal('invalid profile');
        });

        it('Rejects if subdomain has already a profile', async () => {
            const profile2: Lib.account.UserProfile = {
                publicSigningKey: '',
                publicEncryptionKey: '',
                deliveryServices: [''],
            };

            const offChainProfile1 = await getSignedUserProfile();
            const offChainProfile2 = await getSignedUserProfile(profile2);

            //Fund wallets so their balance is not zero
            const [wale] = await hreEthers.getSigners();
            await wale.sendTransaction({
                to: offChainProfile1.signer,
                value: hreEthers.BigNumber.from(1),
            });
            await wale.sendTransaction({
                to: offChainProfile2.signer,
                value: hreEthers.BigNumber.from(1),
            });

            const res1 = await request(app)
                .post(`/address`)
                .send({
                    address: offChainProfile1.signer,
                    signedUserProfile: {
                        signature: offChainProfile1.signature,
                        profile: offChainProfile1.profile,
                    },
                });

            expect(res1.status).to.equal(200);

            const res2 = await request(app)
                .post(`/address`)
                .send({
                    address: offChainProfile1.signer,
                    signedUserProfile: {
                        signature: offChainProfile1.signature,
                        profile: offChainProfile1.profile,
                    },
                });

            expect(res2.status).to.equal(400);
            expect(res2.body.error).to.eql(
                'address has already claimed a subdomain',
            );
        });
        it('Rejects if address already claimed a subdomain', async () => {
            const offChainProfile1 = app.locals.forTests;

            //Fund wallets so their balance is not zero
            const [wale] = await hreEthers.getSigners();
            await wale.sendTransaction({
                to: offChainProfile1.signer,
                value: hreEthers.BigNumber.from(1),
            });

            const res1 = await request(app)
                .post(`/address`)
                .send({
                    address: offChainProfile1.signer,
                    signedUserProfile: {
                        signature: offChainProfile1.signature,
                        profile: offChainProfile1.profile,
                    },
                });

            expect(res1.status).to.equal(200);

            const res2 = await request(app)
                .post(`/address`)
                .send({
                    address: offChainProfile1.signer,
                    signedUserProfile: {
                        signature: offChainProfile1.signature,
                        profile: offChainProfile1.profile,
                    },
                });

            expect(res2.status).to.equal(400);
            expect(res2.body.error).to.eql(
                'address has already claimed a subdomain',
            );
        });
        it('Stores a valid profile', async () => {
            const { signer, profile, signature } = app.locals.forTests;

            //Fund wallet so their balance is not zero
            const [wale] = await hreEthers.getSigners();
            await wale.sendTransaction({
                to: signer,
                value: hreEthers.BigNumber.from(1),
            });

            const { status } = await request(app).post(`/address`).send({
                address: signer,
                signedUserProfile: {
                    signature,
                    profile,
                },
            });

            expect(status).to.equal(200);
        });
    });
    describe('Get User By Account', () => {
        it('Returns 400 if address in invalid', async () => {
            const { status, body } = await request(app).get(`/fooo`).send();
            expect(status).to.equal(400);
        });

        it('Returns 404 if profile does not exists', async () => {
            const { status, body } = await request(app)
                .get(`/${SENDER_ADDRESS}`)
                .send();
            expect(status).to.equal(404);
        });

        it('Returns the profile linked to ', async () => {
            const { signer, profile, signature } = app.locals.forTests;

            //Fund wallet so their balance is not zero
            const [wale] = await hreEthers.getSigners();
            await wale.sendTransaction({
                to: signer,
                value: hreEthers.BigNumber.from(1),
            });

            const writeRes = await request(app).post(`/name`).send({
                name: 'foo.dm3.eth',
                address: signer,
                signedUserProfile: {
                    signature,
                    profile,
                },
            });
            expect(writeRes.status).to.equal(200);

            const { status, body } = await request(app)
                .get(`/${signer}`)
                .send();

            expect(status).to.equal(200);
            expect(body).to.eql({
                signature,
                profile,
            });
        });
    });
});

const getSignedUserProfile = async (
    overwriteProfile?: Lib.account.UserProfile,
) => {
    const profile: Lib.account.UserProfile = overwriteProfile ?? {
        publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
        publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
        deliveryServices: [''],
    };

    const wallet = hreEthers.Wallet.createRandom();

    const createUserProfileMessage = Lib.account.getProfileCreationMessage(
        Lib.stringify(profile),
    );
    const signature = await wallet.signMessage(createUserProfileMessage);

    const signer = wallet.address;

    return { signature, profile, signer };
};
