import { ethers } from 'ethers';
import { getSessionToken, signIn } from './SignIn';
import { createMessagingKeyPair } from '../account/Account';
import { ConnectionState } from '../web3-provider/Web3Provider';

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
    const result = await signIn(
        {
            provider,
            account: {
                address: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            },
            db: {},
        } as any,
        async () => ({
            challenge: 'ENS Mail Sign In ce8eae00-1aae-43e5-ba06-95c981fde58f',
            hasKeys: false,
        }),
        async () =>
            '0x74fd2771eec3c8aff07752885583e549bcc0fb8838ca383aa5d6147901dd' +
            '05716afcf169de14c5e5665ecf989434e767d6d236afa965fc348759c9516344e9791c',
        async () => {},
        async () => {},
        createMessagingKeyPair,
        async () => '',
    );
    expect(result.db?.keys).toBeTruthy();
    expect(result.connectionState).toStrictEqual(ConnectionState.SignedIn);
    expect(result.db?.deliveryServiceToken).toStrictEqual(
        '0xa4f3883eff8d4b11a3e958c40bb451e34de040af75aee13c1f5fc7caafd157d5',
    );
});

test('should be able to handle a failed sign in', async () => {
    const provider = new ethers.providers.Web3Provider(async () => null);

    expect(
        await signIn(
            {
                provider,
                account: {
                    address: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                },
                db: {},
            } as any,

            async () => ({
                challenge:
                    'ENS Mail Sign In ce8eae00-1aae-43e5-ba06-95c981fde58f',
                hasKeys: true,
            }),
            async () => {
                throw Error();
            },
            async () => {},
            async () => {},
            createMessagingKeyPair,
            async () => '',
        ),
    ).toStrictEqual({
        connectionState: ConnectionState.SignInFailed,
    });
});
