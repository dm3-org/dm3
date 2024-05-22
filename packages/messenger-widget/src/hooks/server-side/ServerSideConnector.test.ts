import { ethers } from 'ethers';
import { ServerSideConnector } from './ServerSideConnector';
import {
    createStorageKey,
    getStorageKeyCreationMessage,
} from '@dm3-org/dm3-lib-crypto';
import {
    DEFAULT_NONCE,
    ProfileKeys,
    SignedUserProfile,
    UserProfile,
    createProfileKeys,
    getProfileCreationMessage,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import MockAdapter from 'axios-mock-adapter';

import axios from 'axios';
import { stringify } from 'viem';

describe('Server Side Connector', () => {
    let profileKeys: ProfileKeys;
    let userAddress: string;
    let axiosMock: MockAdapter;
    //Prepare a user profile that is used to test the server side connector
    beforeEach(async () => {
        const userWallet = ethers.Wallet.createRandom();
        const storageKeyCreationMessage = getStorageKeyCreationMessage(
            DEFAULT_NONCE,
            userWallet.address,
        );

        const storageKeySig = await userWallet.signMessage(
            storageKeyCreationMessage,
        );
        const storageKey = await createStorageKey(storageKeySig);
        profileKeys = await createProfileKeys(storageKey, DEFAULT_NONCE);
        userAddress = userWallet.address;

        //setup axios mock
    });

    describe('initial login', () => {
        it('publish profile and retrive token', async () => {
            //mock claim address call

            axiosMock = new MockAdapter(axios);
            axiosMock
                .onPost('http://resolver.api/profile/address')
                .reply(200, {});

            const url = `http://ds1.api/profile/${
                userAddress + '.addr.dm3.eth'
            }`;
            axiosMock.onPost(url).reply(200, 'token');

            const mockProvider = {} as any;
            const signMessage = async (message: string) =>
                Promise.resolve(message + ' signed');

            const connector = new ServerSideConnectorStub(
                mockProvider,
                signMessage,
                'ds.eth',
                'http://ds1.api',
                'http://resolver.api',
                '.addr.dm3.eth',
                'alice.eth',
                userAddress,
                profileKeys,
            );
            const dsResult = await connector.login();
            expect(dsResult.deliveryServiceToken).toBe('token');
        });
    });
    describe('relogin with existing profile', () => {
        it('solve challenge and retrive token', async () => {
            axiosMock = new MockAdapter(axios);

            axiosMock
                .onPost('http://resolver.api/profile/address')
                .reply(200, {});

            axiosMock.onGet('http://ds1.api/profile/alice.eth').reply(200, {});

            const url = `http://ds1.api/profile/${
                userAddress + '.addr.dm3.eth'
            }`;
            axiosMock.onPost(url).reply(200, 'token');

            const mockProvider = {} as any;
            const signMessage = async (message: string) =>
                Promise.resolve(message + ' signed');

            const connector = new ServerSideConnectorStub(
                mockProvider,
                signMessage,
                'ds.eth',
                'http://ds1.api',
                'http://resolver.api',
                '.addr.dm3.eth',
                'alice.eth',
                userAddress,
                profileKeys,
            );
            const dsResult = await connector.login();
            expect(dsResult.deliveryServiceToken).toBe('token');

            //We create another connector to test relogin
            const signedUserProfile = await createNewSignedUserProfile(
                profileKeys,
                userAddress,
                signMessage,
            );

            //Mock challenge
            axiosMock.onGet('http://ds1.api/auth/alice.eth').reply(200, {
                challenge: 'challenge',
            });
            axiosMock.onPost('http://ds1.api/auth/alice.eth').reply(200, {
                token: 'token2',
            });

            const newConnector = new ServerSideConnectorStub(
                mockProvider,
                signMessage,
                'ds.eth',
                'http://ds1.api',
                'http://resolver.api',
                '.addr.dm3.eth',
                'alice.eth',
                userAddress,
                profileKeys,
            );
            const newDsResult = await newConnector.login(signedUserProfile);
            expect(newDsResult.deliveryServiceToken).toBe('token2');
        });
    });
    describe('relogin with existing profile', () => {
        it('publish perviosly created profile and login', async () => {
            axiosMock = new MockAdapter(axios);

            axiosMock
                .onPost('http://resolver.api/profile/address')
                .reply(200, {});

            axiosMock.onGet('http://ds1.api/profile/alice.eth').reply(404, {});

            const url = `http://ds1.api/profile/${
                userAddress + '.addr.dm3.eth'
            }`;
            axiosMock.onPost(url).reply(200, 'new-token');

            const mockProvider = {} as any;
            const signMessage = async (message: string) =>
                Promise.resolve(message + ' signed');

            //We create another connector to test relogin
            const signedUserProfile = await createNewSignedUserProfile(
                profileKeys,
                userAddress,
                signMessage,
            );

            //Mock challenge
            axiosMock.onGet('http://ds1.api/auth/alice.eth').reply(200, {
                challenge: 'challenge',
            });

            const newConnector = new ServerSideConnectorStub(
                mockProvider,
                signMessage,
                'ds.eth',
                'http://ds1.api',
                'http://resolver.api',
                '.addr.dm3.eth',
                'alice.eth',
                userAddress,
                profileKeys,
            );
            const newDsResult = await newConnector.login(signedUserProfile);
            expect(newDsResult.deliveryServiceToken).toBe('new-token');
        });
    });
});
const createNewSignedUserProfile = async (
    { signingKeyPair, encryptionKeyPair }: ProfileKeys,
    address: string,
    signMessage: (message: string) => Promise<string>,
) => {
    const profile: UserProfile = {
        publicSigningKey: signingKeyPair.publicKey,
        publicEncryptionKey: encryptionKeyPair.publicKey,
        deliveryServices: ['ds1.eth'],
    };
    try {
        const profileCreationMessage = getProfileCreationMessage(
            stringify(profile),
            address,
        );
        const signature = await signMessage(profileCreationMessage);

        return {
            profile,
            signature,
        } as SignedUserProfile;
    } catch (error: any) {
        const err = error?.message.split(':');
        throw Error(err.length > 1 ? err[1] : err[0]);
    }
};
class ServerSideConnectorStub extends ServerSideConnector {}

class DeliveryServiceConnector extends ServerSideConnector {
    public getMessages() {
        ///this.fetch()
    }
}
class BackendConnector extends ServerSideConnector {}
