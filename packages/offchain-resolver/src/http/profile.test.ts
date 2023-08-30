import bodyParser from 'body-parser';
import {
    getProfileCreationMessage,
    UserProfile,
} from 'dm3-lib-profile/dist.backend';
import { globalConfig, stringify } from 'dm3-lib-shared/dist.backend';
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
import { createSigningKeyPair, sign } from 'dm3-lib-crypto';

dotenv.config();

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';

describe('Profile', () => {
    let prismaClient: PrismaClient;
    let db: IDatabase;
    let app: express.Express;

    const logger = winston.createLogger({
        transports: [new winston.transports.Console()],
    });

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

        app.locals.config.spamProtection = true;

        process.env.REACT_APP_ADDR_ENS_SUBDOMAIN = '.beta-addr.dm3.eth';
    });

    afterEach(async () => {
        await clearDb(prismaClient);
        prismaClient.$disconnect();
    });

    describe('Create Alias', () => {
        it('Rejects if there is no Profile', async () => {
            app.use(profile(provider));
            const { status, body } = await request(app)
                .post(`/name`)
                .send({
                    alias: 'foo.dm3.eth',
                    name: SENDER_ADDRESS + globalConfig.ADDR_ENS_SUBDOMAIN(),
                    signature: await app.locals.forTests.wallet.signMessage(
                        'alias: foo.dm3.eth',
                    ),
                });

            expect(status).to.equal(400);
            expect(body.error).to.equal('Could not find profile');
        });

        it('Rejects invalid signature', async () => {
            app.use(profile(provider));

            const offChainProfile1 = app.locals.forTests;

            const { status } = await request(app)
                .post(`/address`)
                .send({
                    address: offChainProfile1.signer,
                    signedUserProfile: {
                        signature: offChainProfile1.signature,
                        profile: offChainProfile1.profile,
                    },
                });

            expect(status).to.equal(200);

            const res1 = await request(app)
                .post(`/name`)
                .send({
                    alias: 'foo.dm3.eth',
                    name:
                        offChainProfile1.signer +
                        globalConfig.ADDR_ENS_SUBDOMAIN(),
                    signature: await sign(
                        offChainProfile1.privateSigningKey,
                        'alias: bar.dm3.eth',
                    ),
                });

            expect(res1.status).to.equal(400);
            expect(res1.body.error).to.equal('signature invalid');
        });

        it('Rejects address with an empty eth balance', async () => {
            app.use(
                profile({
                    getBalance: async () => ethers.BigNumber.from(0),
                    resolveName: async () => offChainProfile.signer,
                } as any),
            );
            const offChainProfile = app.locals.forTests;
            await request(app)
                .post(`/address`)
                .send({
                    address: offChainProfile.signer,
                    signedUserProfile: {
                        signature: offChainProfile.signature,
                        profile: offChainProfile.profile,
                    },
                });

            const { status, body } = await request(app)
                .post(`/name`)
                .send({
                    alias: 'foo.dm3.eth',
                    name:
                        offChainProfile.signer +
                        globalConfig.ADDR_ENS_SUBDOMAIN(),
                    signature: await sign(
                        offChainProfile.privateSigningKey,
                        'alias: foo.dm3.eth',
                    ),
                });

            expect(status).to.equal(400);
            expect(body.error).to.equal('Insuficient ETH balance');
        });

        it('Rejects if subdomain is already claimed', async () => {
            app.use(profile(provider));
            const profile2: UserProfile = {
                publicSigningKey: '',
                publicEncryptionKey: '',
                deliveryServices: [''],
            };

            const offChainProfile1 = app.locals.forTests;

            const { status } = await request(app)
                .post(`/address`)
                .send({
                    address: offChainProfile1.signer,
                    signedUserProfile: {
                        signature: offChainProfile1.signature,
                        profile: offChainProfile1.profile,
                    },
                });

            expect(status).to.equal(200);

            const res1 = await request(app)
                .post(`/name`)
                .send({
                    alias: 'foo.dm3.eth',
                    name:
                        offChainProfile1.signer +
                        globalConfig.ADDR_ENS_SUBDOMAIN(),
                    signature: await sign(
                        offChainProfile1.privateSigningKey,
                        'alias: foo.dm3.eth',
                    ),
                });

            expect(res1.status).to.equal(200);

            app.locals.forTests = await getSignedUserProfile(profile2);

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
                    alias: 'foo.dm3.eth',
                    name:
                        offChainProfile1.signer +
                        globalConfig.ADDR_ENS_SUBDOMAIN(),
                    signature: await sign(
                        offChainProfile1.privateSigningKey,
                        'alias: foo.dm3.eth',
                    ),
                });

            expect(res2.status).to.equal(400);
            expect(res2.body.error).to.eql('Could not create alias');
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

            const offChainProfile1 = await getSignedUserProfile();

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
            expect(res2.body.error).to.eql('subdomain already claimed');
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
    describe('remove profile', () => {
        it('removes an existing profile', async () => {
            const {
                signer,
                profile: userProfile,
                signature,
                wallet,
                privateSigningKey,
            } = await getSignedUserProfile();

            app.locals.config.spamProtection = false;

            app.use(
                profile({
                    ...provider,
                    resolveName: async () => signer,
                } as any),
            );

            const writeRes = await request(app)
                .post(`/address`)
                .send({
                    address: signer,
                    signedUserProfile: {
                        signature,
                        profile: userProfile,
                    },
                });
            expect(writeRes.status).to.equal(200);

            const writeRes2 = await request(app)
                .post(`/name`)
                .send({
                    alias: 'foo.dm3.eth',
                    name: signer + globalConfig.ADDR_ENS_SUBDOMAIN(),
                    signature: await sign(
                        privateSigningKey,
                        'alias: foo.dm3.eth',
                    ),
                });
            expect(writeRes2.status).to.equal(200);

            const writeRes3 = await request(app)
                .post(`/deleteName`)
                .send({
                    name: 'foo.dm3.eth',
                    signature: await sign(
                        privateSigningKey,
                        'remove: foo.dm3.eth',
                    ),
                });
            expect(writeRes3.status).to.equal(200);
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
                privateSigningKey,
            } = app.locals.forTests;

            const writeRes = await request(app)
                .post(`/address`)
                .send({
                    address: signer,
                    signedUserProfile: {
                        signature,
                        profile: userProfile,
                    },
                });
            expect(writeRes.status).to.equal(200);

            const writeRes2 = await request(app)
                .post(`/name`)
                .send({
                    alias: 'foo.dm3.eth',
                    name: signer + globalConfig.ADDR_ENS_SUBDOMAIN(),
                    signature: await sign(
                        privateSigningKey,
                        'alias: foo.dm3.eth',
                    ),
                });
            expect(writeRes2.status).to.equal(200);

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
        publicSigningKey: 'JLCk6OPLzIn/Fye/0UW4XfP2Q7CoffEhVLveBYBh8CI=',
        publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
        deliveryServices: [''],
    };

    const wallet = ethers.Wallet.createRandom();

    const createUserProfileMessage = getProfileCreationMessage(
        stringify(profile),
    );
    const signature = await wallet.signMessage(createUserProfileMessage);

    const signer = wallet.address;

    return {
        signature,
        profile,
        signer,
        wallet,
        privateSigningKey:
            'x8DPXL+cNC21Voi69Rg/GG9ZoGVEHkT8uVfoBrgfgdwksKTo48vMif8XJ7/RRbhd8/ZDsKh98SFUu94FgGHwIg==',
    };
};
