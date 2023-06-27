import bodyParser from 'body-parser';
import {
    getProfileCreationMessage,
    UserProfile,
} from 'dm3-lib-profile/dist.backend';
import { stringify } from 'dm3-lib-shared/dist.backend';
import { ethers } from 'ethers';
import express from 'express';

import request from 'supertest';
import winston from 'winston';
import { getDatabase, getDbClient } from '../persistance/getDatabase';
import { IDatabase } from '../persistance/IDatabase';
import { profile } from './profile';

import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { clearDb } from '../persistance/clearDb';

import { expect } from 'chai';

dotenv.config();

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';

describe('Profile', () => {
    let prismaClient: PrismaClient;
    let db: IDatabase;
    let app: express.Express;

    const logger = winston.createLogger({
        transports: [new winston.transports.Console()],
    });

    const getSigners = () => {
        return [
            ethers.Wallet.fromMnemonic(
                'test test test test test test test test test test test junk',
                `m/44'/60'/0'/0/0`,
            ),
        ];
    };
    const provider: ethers.providers.JsonRpcProvider = new Proxy(
        {
            getBalance: async () => ethers.BigNumber.from(1),
        } as any,
        {
            get(target, prop) {
                const resolveName = async () => app.locals.forTests.signer;
                return prop === 'resolveName' ? resolveName : target[prop];
            },
        },
    );

    beforeEach(async () => {
        prismaClient = await getDbClient(logger);
        db = await getDatabase(logger, prismaClient);
        await clearDb(prismaClient);

        app = express();
        app.use(bodyParser.json());

        app.locals.forTests = await getSignedUserProfile();

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
        await clearDb(prismaClient);
        prismaClient.$disconnect();
    });

    describe('Store UserProfile by ens name', () => {
        it('Rejects invalid schema', async () => {
            app.use(profile(provider));
            const { status, body } = await request(app).post(`/name`).send({
                name: 'foo.dm3.eth',
                address: SENDER_ADDRESS,
                signedUserProfile: {},
            });

            expect(status).to.equal(400);
            expect(body.error).to.equal('invalid schema');
        });
        it('Rejects invalid profile', async () => {
            app.use(profile(provider));
            const userProfile: UserProfile = {
                publicSigningKey:
                    '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
                publicEncryptionKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                deliveryServices: [''],
            };

            const wallet = ethers.Wallet.createRandom();

            const signature = await wallet.signMessage('foo');

            const { status, body } = await request(app)
                .post(`/name`)
                .send({
                    name: 'foo.dm3.eth',
                    address: wallet.address,
                    signedUserProfile: {
                        profile: userProfile,
                        signature,
                    },
                });

            expect(status).to.equal(400);
            expect(body.error).to.equal('invalid profile');
        });

        it('Rejects address with an empty eth balance', async () => {
            app.use(
                profile({
                    getBalance: async () => ethers.BigNumber.from(0),
                    resolveName: async () => offChainProfile.signer,
                } as any),
            );
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
            app.use(profile(provider));
            const profile2: UserProfile = {
                publicSigningKey: '',
                publicEncryptionKey: '',
                deliveryServices: [''],
            };

            const offChainProfile1 = app.locals.forTests;

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

            const app2 = express();
            app2.use(bodyParser.json());

            app2.use(
                profile({
                    getBalance: async () => ethers.BigNumber.from(1),
                    resolveName: async () => app.locals.forTests.signer,
                } as any),
            );
            app2.locals.config = { spamProtection: true };
            app2.locals.db = db;

            app2.locals.logger = {
                // eslint-disable-next-line no-console
                info: (msg: string) => console.log(msg),
                // eslint-disable-next-line no-console
                warn: (msg: string) => console.log(msg),
            };

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
            app.use(profile(provider));
            const offChainProfile1 = app.locals.forTests;

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
            app.use(profile(provider));
            const {
                signer,
                profile: userProfile,
                signature,
            } = app.locals.forTests;

            //Fund wallet so their balance is not zero
            const [wale] = getSigners();

            const { status, body } = await request(app)
                .post(`/name`)
                .send({
                    name: signer,
                    address: signer,
                    signedUserProfile: {
                        signature,
                        profile: userProfile,
                    },
                });

            expect(status).to.equal(400);
            expect(body.error).to.equal('Invalid ENS name');
        });
        it('Stores a valid profile', async () => {
            app.use(profile(provider));
            const {
                signer,
                profile: userProfile,
                signature,
            } = app.locals.forTests;

            const { status } = await request(app)
                .post(`/name`)
                .send({
                    name: 'foo.dm3.eth',
                    address: signer,
                    signedUserProfile: {
                        signature,
                        profile: userProfile,
                    },
                });

            expect(status).to.equal(200);
        });
    });

    describe('Store UserProfile by address', () => {
        it('Rejects invalid schema', async () => {
            app.use(profile(provider));
            const { status, body } = await request(app).post(`/address`).send({
                address: SENDER_ADDRESS,
                signedUserProfile: {},
            });

            expect(status).to.equal(400);
            expect(body.error).to.equal('invalid schema');
        });
        it('Rejects invalid profile', async () => {
            app.use(profile(provider));
            const userProfile: UserProfile = {
                publicSigningKey:
                    '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
                publicEncryptionKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                deliveryServices: [''],
            };

            const wallet = ethers.Wallet.createRandom();

            const signature = await wallet.signMessage('foo');

            const { status, body } = await request(app)
                .post(`/address`)
                .send({
                    address: wallet.address,
                    signedUserProfile: {
                        profile: userProfile,
                        signature,
                    },
                });

            expect(status).to.equal(400);
            expect(body.error).to.equal('invalid profile');
        });

        it('Rejects if subdomain has already a profile', async () => {
            app.use(profile(provider));
            const profile2: UserProfile = {
                publicSigningKey: '',
                publicEncryptionKey: '',
                deliveryServices: [''],
            };

            const offChainProfile1 = await getSignedUserProfile();
            const offChainProfile2 = await getSignedUserProfile(profile2);

            //Fund wallets so their balance is not zero

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
            app.use(profile(provider));
            const offChainProfile1 = app.locals.forTests;

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
            app.use(profile(provider));
            const {
                signer,
                profile: userProfile,
                signature,
            } = app.locals.forTests;

            const { status } = await request(app)
                .post(`/address`)
                .send({
                    address: signer,
                    signedUserProfile: {
                        signature,
                        profile: userProfile,
                    },
                });

            expect(status).to.equal(200);
        });
    });
    describe('Get User By Account', () => {
        it('Returns 400 if address in invalid', async () => {
            app.use(profile(provider));
            const { status, body } = await request(app).get(`/fooo`).send();
            expect(status).to.equal(400);
        });

        it('Returns 404 if profile does not exists', async () => {
            app.use(profile(provider));
            const { status, body } = await request(app)
                .get(`/${SENDER_ADDRESS}`)
                .send();
            expect(status).to.equal(404);
        });

        it('Returns the profile linked to ', async () => {
            app.use(profile(provider));
            const {
                signer,
                profile: userProfile,
                signature,
            } = app.locals.forTests;

            const writeRes = await request(app)
                .post(`/name`)
                .send({
                    name: 'foo.dm3.eth',
                    address: signer,
                    signedUserProfile: {
                        signature,
                        profile: userProfile,
                    },
                });
            expect(writeRes.status).to.equal(200);

            const { status, body } = await request(app)
                .get(`/${signer}`)
                .send();

            expect(status).to.equal(200);
            expect(body).to.eql({
                signature,
                profile: userProfile,
            });
        });
    });
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
