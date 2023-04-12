import * as Lib from 'dm3-lib';

test('handels no web3 provider correctly', async () => {
    expect(await Lib.web3provider.getWeb3Provider(null)).toStrictEqual({
        connectionState: Lib.web3provider.ConnectionState.ConnectionRejected,
    });
});

test('handels web3 provider correctly', async () => {
    expect(
        (await Lib.web3provider.getWeb3Provider(async () => null))
            .connectionState,
    ).toStrictEqual(Lib.web3provider.ConnectionState.AccountConntectReady);
});
