import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { addContact, Connection } from './Web3Provider';
import {
    connectAccount,
    ConnectionState,
    getAccountDisplayName,
    getWeb3Provider,
} from './Web3Provider';

test('handels no web3 provider correctly', async () => {
    expect(await getWeb3Provider(null)).toStrictEqual({
        connectionState: ConnectionState.NoProvider,
    });
});

test('handels web3 provider correctly', async () => {
    expect(
        (await getWeb3Provider(async () => null)).connectionState,
    ).toStrictEqual(ConnectionState.AccountConntectReady);
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
        connectionState: ConnectionState.SignInReady,
    });
});

test('should set correct state if account connection failed', async () => {
    const provider = new ethers.providers.Web3Provider(async () => null);

    expect(
        await connectAccount(provider, async (provider: JsonRpcProvider) => {
            throw Error();
        }),
    ).toStrictEqual({
        connectionState: ConnectionState.AccountConnectionRejected,
    });
});

test('get correct account display name', async () => {
    const ensNames = new Map();
    ensNames.set('0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855', 'test1');
    expect(
        getAccountDisplayName(
            '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            ensNames,
        ),
    ).toStrictEqual('test1');

    expect(
        getAccountDisplayName(
            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            ensNames,
        ),
    ).toStrictEqual('0x25...8292');
});

test('add a contact', async () => {
    expect(
        addContact(
            {
                connectionState: ConnectionState.SignedIn,
                socket: null as any,
            } as any,
            '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            async (provider: JsonRpcProvider, input: string) => input,
            async (connection: Connection, contactAddress: string) => {},
        ),
    ).resolves;
});

test('handle add contact error', async () => {
    expect.assertions(1);
    await expect(
        addContact(
            {
                connectionState: ConnectionState.SignedIn,
                socket: null as any,
            } as any,
            '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            async (provider: JsonRpcProvider, input: string) => input,
            async (connection: Connection, contactAddress: string) => {
                throw Error('err');
            },
        ),
    ).rejects.toEqual(Error('err'));
});
