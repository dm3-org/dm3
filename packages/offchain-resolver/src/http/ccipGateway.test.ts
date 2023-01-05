import bodyParser from 'body-parser';
import express from 'express';
import { ccipGateway } from './ccipGateway';
import request from 'supertest';
import * as Lib from 'dm3-lib/dist.backend';
import { ethers } from 'ethers';
import { getRedisClient, Redis, getDatabase } from '../persistance/getDatabase';
import { IDatabase } from '../persistance/IDatabase';

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';

describe('CCIP Gateway', () => {
    let redisClient: Redis;
    let db: IDatabase;
    let app: express.Express;

    beforeEach(async () => {
        redisClient = await getRedisClient();
        db = await getDatabase(redisClient);
        await redisClient.flushDb();

        app = express();
        app.use(bodyParser.json());
        app.use(ccipGateway());

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
        it('Returns Offchain Userprofile', async () => {
            const { signer, profile, signature } = await getSignedUserProfile();

            const name = 'foo.dm3.eth';
            //Create the profile in the first place
            const { status } = await request(app).post(`/`).send({
                name,
                address: signer,
                signedUserProfile: {
                    signature,
                    profile,
                },
            });

            const { body } = await request(app).get(`/${name}`);
            expect(body.profile).toStrictEqual(profile);
            expect(body.profile).toStrictEqual(profile);
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

    const wallet = ethers.Wallet.createRandom();

    const createUserProfileMessage = Lib.account.getProfileCreationMessage(
        Lib.stringify(profile),
    );
    const signature = await wallet.signMessage(createUserProfileMessage);

    const signer = wallet.address;

    return { signature, profile, signer };
};
