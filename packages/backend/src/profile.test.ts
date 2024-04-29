import bodyParser from 'body-parser';

import {
    SignedUserProfile,
    UserProfile,
    getProfileCreationMessage,
} from '@dm3-org/dm3-lib-profile';
import { stringify } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import express from 'express';
import request from 'supertest';
import profile from './profile';
import winston from 'winston';

async function getEnsTextRecord(
    provider: ethers.providers.JsonRpcProvider,
    ensName: string,
    recordKey: string,
) {
    try {
        const resolver = await provider.getResolver(ensName);
        if (resolver === null) {
            return;
        }

        return await resolver.getText(recordKey);
    } catch (e) {
        return undefined;
    }
}
global.logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});

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
                getIdEnsName: async (ensName: string) => ensName,
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
                    getIdEnsName: async (ensName: string) => ensName,
                },
            };

            const userProfile: UserProfile = {
                publicSigningKey: '2',
                publicEncryptionKey: '1',
                deliveryServices: [],
            };

            const createUserProfileMessage = getProfileCreationMessage(
                stringify(userProfile),
                wallet.address,
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
                getIdEnsName: async (ensName: string) => ensName,
            };

            const userProfile: UserProfile = {
                publicSigningKey: '2',
                publicEncryptionKey: '1',
                deliveryServices: [],
            };

            const mnemonic =
                'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

            const wallet = ethers.Wallet.fromMnemonic(mnemonic);

            const signature = await wallet.signMessage(stringify(userProfile));

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
    describe('submitUserProfile siwe ', () => {
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
                    getIdEnsName: async (ensName: string) => ensName,
                },
            };

            const siweMsg = 'my dapp msg';
            const secret = 'my-secret';

            const emptyProfile: UserProfile = {
                publicSigningKey: '',
                publicEncryptionKey: '',
                deliveryServices: [''],
            };

            const ownerWallet = ethers.Wallet.createRandom();
            const carrierWallet = new ethers.Wallet(
                ethers.utils.sha256(ethers.utils.toUtf8Bytes(secret)),
            );

            //Sign profile
            const profileSigMessage = getProfileCreationMessage(
                stringify(emptyProfile),
                carrierWallet.address,
            );
            //Sign profile with carrier msg
            const profileSig = await carrierWallet.signMessage(
                profileSigMessage,
            );

            const signedUserProfile: SignedUserProfile = {
                profile: emptyProfile,
                signature: profileSig,
            };

            const siwePayload = {
                //Check ownership of the address
                address: ownerWallet.address,
                message: siweMsg,
                signature: await ownerWallet.signMessage(siweMsg),

                //Use the worng address to provoke the exception
                carrierAddress: carrierWallet.address,
                signedUserProfile,
            };
            const { status } = await request(app)
                .post(`/siwe/${wallet.address}`)
                .send(siwePayload);

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
                getIdEnsName: async (ensName: string) => ensName,
            };

            const userProfile: UserProfile = {
                publicSigningKey: '2',
                publicEncryptionKey: '1',
                deliveryServices: [],
            };

            const signedUserProfile = {
                profile: userProfile,
                signature: null,
            };

            const { status } = await request(app)
                .post(`/siwe/1234`)
                .send(signedUserProfile);

            expect(status).toBe(400);
        });
    });
});
