import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import {
    connectAccount,
    ConnecteionState,
    getSessionToken,
    getWeb3Provider,
    signIn,
} from './Web3Provider';

test('handels no web3 provider correctly', async () => {
    expect(await getWeb3Provider(null)).toStrictEqual({
        connectionState: ConnecteionState.NoProvider,
    });
});

test('handels web3 provider correctly', async () => {
    expect(
        (await getWeb3Provider(async () => null)).connectionState,
    ).toStrictEqual(ConnecteionState.AccountConntectReady);
});

test('should be able to connect to an injected account', async () => {
    const provider = new ethers.providers.Web3Provider(async () => null);

    expect(
        await connectAccount(
            provider,
            async (provider: JsonRpcProvider) =>
                '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        ),
    ).toStrictEqual({
        account: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        connectionState: ConnecteionState.SignInReady,
    });
});

test('should set correct state if account connection failed', async () => {
    const provider = new ethers.providers.Web3Provider(async () => null);

    expect(
        await connectAccount(provider, async (provider: JsonRpcProvider) => {
            throw Error();
        }),
    ).toStrictEqual({
        connectionState: ConnecteionState.AccountConnectionRejected,
    });
});

test('getSessionToken', async () => {
    expect(
        getSessionToken(
            '0x74fd2771eec3c8aff07752885583e549bcc0fb8838ca383aa5d6147901dd0571' +
                '6afcf169de14c5e5665ecf989434e767d6d236afa965fc348759c9516344e9791c',
        ),
    ).toStrictEqual(
        '0xa4f3883eff8d4b11a3e958c40bb451e34de040af75aee13c1f5fc7caafd157d5',
    );
});

test('should be able to sign in', async () => {
    const provider = new ethers.providers.Web3Provider(async () => null);

    expect(
        await signIn(
            provider,
            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            async (account: string) =>
                'ENS Mail Sign In ce8eae00-1aae-43e5-ba06-95c981fde58f',
            async (
                provider: JsonRpcProvider,
                account: string,
                challenge: string,
            ) =>
                '0x74fd2771eec3c8aff07752885583e549bcc0fb8838ca383aa5d6147901dd' +
                '05716afcf169de14c5e5665ecf989434e767d6d236afa965fc348759c9516344e9791c',
            async (challenge: string, signature: string) => {},
        ),
    ).toStrictEqual({
        connectionState: ConnecteionState.SignedIn,
        sessionToken:
            '0xa4f3883eff8d4b11a3e958c40bb451e34de040af75aee13c1f5fc7caafd157d5',
    });
});

test('should be able to handle a failed sign in', async () => {
    const provider = new ethers.providers.Web3Provider(async () => null);

    expect(
        await signIn(
            provider,
            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            async (account: string) =>
                'ENS Mail Sign In ce8eae00-1aae-43e5-ba06-95c981fde58f',
            async (
                provider: JsonRpcProvider,
                account: string,
                challenge: string,
            ) => {
                throw Error();
            },
            async (challenge: string, signature: string) => {},
        ),
    ).toStrictEqual({
        connectionState: ConnecteionState.SignInFailed,
    });
});
