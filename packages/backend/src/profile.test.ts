import bodyParser from 'body-parser';
import express from 'express';
import profile from './profile';
import request from 'supertest';
import { ethers } from 'ethers';
import { getUserProfile } from 'dm3-lib/dist.backend/account';
import { UserProfile } from 'dm3-lib/dist/account/Account';
import * as Lib from 'dm3-lib/dist.backend';

describe('Profile', () => {
    describe('getProfile', () => {
        it('Returns 200 if schema is valid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(profile());

            app.locals.loadSession = (_: string) =>
                Promise.resolve({
                    signedUserProfile: {},
                });

            const { status } = await request(app)
                .get('/0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870')
                .send();

            expect(status).toBe(200);
        });
        it('Returns 400 if schema is invalid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(profile());

            app.locals.loadSession = (_: string) =>
                Promise.resolve({
                    signedUserProfile: {},
                });

            const { status, body } = await request(app).get('/12345').send();

            expect(status).toBe(400);
        });
    });

    describe('submitUserProfile', () => {
        it.only('Returns 200 if schema is valid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(profile());

            app.locals.loadSession = (_: string) => Promise.resolve(null);

            app.locals.storeSession = (_: string, __: any) => {};

            app.locals.redisClient = {
                sMembers: (_: any) => Promise.resolve([]),
            };

            const userProfile: UserProfile = {
                publicSigningKey: '2',
                publicEncryptionKey: '1',
                deliveryServices: [],
            };

            const mnemonic =
                'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

            const wallet = ethers.Wallet.fromMnemonic(mnemonic);

            const signature = await wallet.signMessage(
                Lib.stringify(userProfile),
            );

            const signedUserProfile = {
                profile: userProfile,
                signature,
            };

            const { status } = await request(app)
                .post(`/${wallet.address}`)
                .send(signedUserProfile);

            expect(status).toBe(200);
        });
        it('Returns 400 if schema is invalid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(profile());

            app.locals.loadSession = (_: string) => Promise.resolve(null);

            app.locals.storeSession = (_: string, __: any) => {};

            app.locals.redisClient = {
                sMembers: (_: any) => Promise.resolve([]),
            };

            const userProfile: UserProfile = {
                publicSigningKey: '2',
                publicEncryptionKey: '1',
                deliveryServices: [],
            };

            const mnemonic =
                'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

            const wallet = ethers.Wallet.fromMnemonic(mnemonic);

            const signature = await wallet.signMessage(
                Lib.stringify(userProfile),
            );

            const signedUserProfile = {
                profile: userProfile,
                signature,
            };

            const { status } = await request(app)
                .post(`/1234`)
                .send(signedUserProfile);

            expect(status).toBe(400);
        });
    });
});
