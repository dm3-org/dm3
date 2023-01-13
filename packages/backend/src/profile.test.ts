import bodyParser from 'body-parser';
import * as Lib from 'dm3-lib/dist.backend';
import { UserProfile } from 'dm3-lib/dist/account/Account';
import { ethers } from 'ethers';
import express from 'express';
import request from 'supertest';
import profile from './profile';

describe('Profile', () => {
    describe('getProfile', () => {
        it('Returns 200 if schema is valid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(profile());

            app.locals.db = {
                getSession: async (ensName: string) => ({
                    signedUserProfile: {},
                }),
                setSession: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
            };

            const { status } = await request(app)
                .get('/0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870')
                .send();

            expect(status).toBe(200);
        });
    });

    describe('submitUserProfile', () => {
        it('Returns 200 if schema is valid', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(profile());

            const mnemonic =
                'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

            const wallet = ethers.Wallet.fromMnemonic(mnemonic);

            app.locals = {
                web3Provider: { resolveName: async () => wallet.address },
                db: {
                    getSession: async (ensName: string) =>
                        Promise.resolve(null),
                    setSession: async (_: string, __: any) => {
                        return (_: any, __: any, ___: any) => {};
                    },
                    getPending: (_: any) => [],
                },
            };

            const userProfile: UserProfile = {
                publicSigningKey: '2',
                publicEncryptionKey: '1',
                deliveryServices: [],
            };

            const createUserProfileMessage =
                Lib.account.getProfileCreationMessage(
                    Lib.stringify(userProfile),
                );
            const signature = await wallet.signMessage(
                createUserProfileMessage,
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

            app.locals.db = {
                getSession: async (accountAddress: string) =>
                    Promise.resolve(null),
                setSession: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                getPending: (_: any) => [],
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
                signature: null,
            };

            const { status } = await request(app)
                .post(`/1234`)
                .send(signedUserProfile);

            expect(status).toBe(400);
        });
    });
});
