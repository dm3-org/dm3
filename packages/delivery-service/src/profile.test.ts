import bodyParser from 'body-parser';

import {
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
            const db = {
                getAccount: async (ensName: string) => ({
                    signedUserProfile: {},
                }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                getIdEnsName: async (ensName: string) => ensName,
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(profile(db as any, {} as any, {} as any, 'my-secret'));

            const { status } = await request(app)
                .get('/0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870')
                .send();

            expect(status).toBe(200);
        });
    });

    describe('submitUserProfile', () => {
        it('Returns 200 if schema is valid', async () => {
            const web3Provider = { resolveName: async () => wallet.address };
            const db = {
                getAccount: async (ensName: string) => Promise.resolve(null),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                getPending: (_: any) => [],
                getIdEnsName: async (ensName: string) => ensName,
            };
            const app = express();
            app.use(bodyParser.json());
            app.use(
                profile(db as any, web3Provider as any, {} as any, 'my-secret'),
            );

            const mnemonic =
                'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

            const wallet = ethers.Wallet.fromMnemonic(mnemonic);

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
            const db = {
                getAccount: async (accountAddress: string) =>
                    Promise.resolve(null),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                getPending: (_: any) => [],
                getIdEnsName: async (ensName: string) => ensName,
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(profile(db as any, {} as any, {} as any, 'my-secret'));

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
});
