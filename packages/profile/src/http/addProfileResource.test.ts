import bodyParser from 'body-parser';
import express from 'express';
import { addProfileResource } from './addProfileResource';
import request from 'supertest';
import * as Lib from 'dm3-lib/dist.backend';
import { ethers } from 'ethers';
import { getRedisClient, Redis, getDatabase } from '../persistance/getDatabase';
import { IDatabase } from '../persistance/IDatabase';

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';

describe('getProfileResource', () => {
    let redisClient: Redis;
    let db: IDatabase;
    let app: express.Express;

    beforeEach(async () => {
        redisClient = await getRedisClient();
        db = await getDatabase(redisClient);
        await redisClient.flushDb();

        app = express();
        app.use(bodyParser.json());
        app.use(addProfileResource());

        app.locals.db = db;
    });

    afterEach(async () => {
        await redisClient.flushDb();
        await redisClient.disconnect();
    });
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
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        const mnemonic =
            'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

        const wallet = ethers.Wallet.fromMnemonic(mnemonic);

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
        const profile1: Lib.account.UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };
        const profile2: Lib.account.UserProfile = {
            publicSigningKey: '',
            publicEncryptionKey: '',
            deliveryServices: [''],
        };

        const mnemonic =
            'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

        const wallet = ethers.Wallet.fromMnemonic(mnemonic);

        const createUserProfileMessage1 = Lib.account.getProfileCreationMessage(
            Lib.stringify(profile1),
        );
        const createUserProfileMessage2 = Lib.account.getProfileCreationMessage(
            Lib.stringify(profile2),
        );
        const signature1 = await wallet.signMessage(createUserProfileMessage1);
        const signature2 = await wallet.signMessage(createUserProfileMessage2);

        const res1 = await request(app)
            .post(`/`)
            .send({
                name: 'foo.dm3.eth',
                address: wallet.address,
                signedUserProfile: {
                    signature: signature1,
                    profile: profile1,
                },
            });

        expect(res1.status).toBe(200);

        const res2 = await request(app)
            .post(`/`)
            .send({
                name: 'foo.dm3.eth',
                address: wallet.address,
                signedUserProfile: {
                    signature: signature2,
                    profile: profile2,
                },
            });

        expect(res2.status).toBe(400);
        expect(res2.body.error).toStrictEqual('subdomain already claimed');
    });
    it('Stores a valid profile', async () => {
        const profile: Lib.account.UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        const mnemonic =
            'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

        const wallet = ethers.Wallet.fromMnemonic(mnemonic);

        const createUserProfileMessage = Lib.account.getProfileCreationMessage(
            Lib.stringify(profile),
        );
        const signature = await wallet.signMessage(createUserProfileMessage);

        const { status } = await request(app).post(`/`).send({
            name: 'foo.dm3.eth',
            address: wallet.address,
            signedUserProfile: {
                signature,
                profile,
            },
        });

        expect(status).toBe(200);
    });
});
