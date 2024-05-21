import { ethers } from 'ethers';
import { ServerSideConnector } from './ServerSideConnector';
import {
    createStorageKey,
    getStorageKeyCreationMessage,
} from '@dm3-org/dm3-lib-crypto';
import {
    DEFAULT_NONCE,
    ProfileKeys,
    createProfileKeys,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import MockAdapter from 'axios-mock-adapter';

import axios from 'axios';

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

    describe('initial login login', () => {
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

            //@ts-ignore
            console.log(axiosMock.handlers.post);

            const mockProvider = {} as any;
            const signMessage = async (message: string) => Promise.resolve('');

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
            await connector.login();
        });
    });
});

class ServerSideConnectorStub extends ServerSideConnector {}
