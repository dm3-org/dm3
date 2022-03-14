import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { Connection } from './Web3Provider';
import {
    connectAccount,
    ConnectionState,
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
