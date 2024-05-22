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

    describe('relogin with existing profile', () => {
        it('solve challenge and retrive token', async () => {
            axiosMock = new MockAdapter(axios);

            axiosMock
                .onPost('http://resolver.api/profile/address')
                .reply(200, {});

            axiosMock.onGet('http://ds1.api/profile/alice.eth').reply(404, {});

            const url = `http://ds1.api/profile/${
                userAddress + '.addr.dm3.eth'
            }`;
            axiosMock.onPost(url).reply(200, 'token');

            const mockProvider = {} as any;
            const signMessage = async (message: string) =>
                Promise.resolve(message + ' signed');

            const signedUserProfile = await createNewSignedUserProfile(
                profileKeys,
                userAddress,
                signMessage,
            );

            console.log('check 1');
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
            const dsResult = await connector.login(signedUserProfile);
            expect(dsResult.deliveryServiceToken).toBe('token');

            console.log('check 2');

            //Alice is now logged in
            axiosMock.onGet('http://ds1.api/profile/alice.eth').reply(200, {});

            //Mock challenge
            axiosMock.onGet('http://ds1.api/auth/alice.eth').reply(200, {
                challenge: 'challenge',
            });
            axiosMock.onPost('http://ds1.api/auth/alice.eth').reply(200, {
                token: 'token2',
            });

            //We create another connector to test relogin
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
    describe('signup with existing profile', () => {
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

    describe('JwtInterceptor', () => {
        it('returns error other than 401', async () => {
            //mock test request
            axiosMock = new MockAdapter(axios);
            axiosMock.onGet('http://ds1.api/test').reply(500, {});

            const connector = new ServerSideConnectorStub(
                {} as any,
                async () => '',
                'ds.eth',
                'http://ds1.api',
                'http://resolver.api',
                '.addr.dm3.eth',
                'alice.eth',
                userAddress,
                profileKeys,
            );
            const testRes = await connector.testError();
            expect(testRes).toBe(true);
        });
        it('uses token for authentication', async () => {
            //mock test request
            axiosMock = new MockAdapter(axios);
            axiosMock
                .onPost('http://resolver.api/profile/address')
                .reply(200, {});

            const url = `http://ds1.api/profile/${
                userAddress + '.addr.dm3.eth'
            }`;
            axiosMock.onPost(url).reply(200, 'token');

            axiosMock.onGet('http://ds1.api/test1').reply(200);

            const mockProvider = {} as any;
            const signMessage = async (message: string) =>
                Promise.resolve(message + ' signed');

            const signedUserProfile = await createNewSignedUserProfile(
                profileKeys,
                userAddress,
                signMessage,
            );
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
            await connector.login(signedUserProfile);
            const testRes = await connector.testHeader();
            expect(testRes).toBe(true);
        });
        it('renews token when requests returns 401', async () => {
            //mock test request
            axiosMock = new MockAdapter(axios);
            axiosMock
                .onPost('http://resolver.api/profile/address')
                .reply(200, {});

            const url = `http://ds1.api/profile/${
                userAddress + '.addr.dm3.eth'
            }`;
            axiosMock.onPost(url).reply(200, 'token');

            axiosMock.onGet('http://ds1.api/test1').replyOnce(401);
            axiosMock.onGet('http://ds1.api/test1').reply(200);

            //Mock challenge
            axiosMock.onGet('http://ds1.api/auth/alice.eth').reply(200, {
                challenge: 'challenge',
            });
            axiosMock.onPost('http://ds1.api/auth/alice.eth').reply(200, {
                token: 'reauth',
            });

            const mockProvider = {} as any;
            const signMessage = async (message: string) =>
                Promise.resolve(message + ' signed');

            const signedUserProfile = await createNewSignedUserProfile(
                profileKeys,
                userAddress,
                signMessage,
            );

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
            await connector.login(signedUserProfile);
            const testRes = await connector.testReAuth();
            expect(testRes).toBe(true);
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
class ServerSideConnectorStub extends ServerSideConnector {
    public async testError() {
        const axios = this.getAuthenticatedAxiosClient();
        return axios
            .get('/test')
            .then((res: any) => {
                return false;
            })
            .catch((_) => {
                return true;
            });
    }
    public async testHeader() {
        const axios = this.getAuthenticatedAxiosClient();
        return axios.get('/test1').then((res: any) => {
            return (
                axios.defaults.headers.common['Authorization'] ===
                'Bearer token'
            );
        });
    }
    public async testReAuth() {
        const axios = this.getAuthenticatedAxiosClient();
        return axios.get('/test1').then((res: any) => {
            console.log(axios.defaults.headers.common['Authorization']);
            return (
                axios.defaults.headers.common['Authorization'] ===
                'Bearer reauth'
            );
        });
    }
}
