import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import {
    Connection,
    ConnectionState,
    getWeb3Provider,
} from '../web3-provider/Web3Provider';
import { connectAccount } from './Connect';

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
