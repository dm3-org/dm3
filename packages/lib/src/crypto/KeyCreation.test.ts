import {
    createKeyPair,
    createReceiverSessionKey,
    createSenderSessionKey,
    createSigningKeyPair,
    createStorageKey,
    getStorageKeyCreationMessage,
} from './KeyCreation';

test('should get a correct storage key creation message', async () => {
    const message = await getStorageKeyCreationMessage(99);
    expect(message).toEqual(
        'Sign this to retrieve your dm3 encryption key.\nNonce: 99',
    );
});

test('should get a correct storage key', async () => {
    const sig =
        '0xb9b0a77f501c6db70c5e8f7d1e6be1642b8b7e897d681c69921569cb84b0a' +
        '87d52cd22d501de45a643d4058bdba96d5614faf7dc4461a5931fc90ddecb2e84991b';
    const key = await createStorageKey(sig);
    expect(key).toEqual(
        '0x86c1409e089f37c8d204592b54a2f536058a2c26cb6091ca2d376be8b3f196a4',
    );
});

test('should create a public private key pair', async () => {
    const keyPair = await createKeyPair();
    expect(keyPair).toEqual(
        expect.objectContaining({
            publicKey: expect.any(String),
            privateKey: expect.any(String),
        }),
    );
});

test('should create a public private key pair with seed', async () => {
    const keyPair = await createKeyPair(
        '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb895',
    );
    expect(keyPair).toEqual({
        publicKey:
            '0x78798cab6f457a23ca7cd3e449cb4fb99197bd5d2c29e3bf299917da75ef320c',
        privateKey:
            '0xa4c23bec5db0dc62bea2664207803ad560ea21238e9d61974767ff3132dba9b6',
    });
});

test('should create a public private signing key pair', async () => {
    const keyPair = await createSigningKeyPair();
    expect(keyPair).toEqual(
        expect.objectContaining({
            publicKey: expect.any(String),
            privateKey: expect.any(String),
        }),
    );
});

test('should create a public private signing key pair with seed', async () => {
    const keyPair = await createSigningKeyPair(
        '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb895',
    );
    expect(keyPair).toEqual({
        publicKey:
            '0xfad90341665fbfd8b106639bb1ff2d8131d365a8f0004f66b93b450148f67bd2',
        privateKey:
            '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb89' +
            '5fad90341665fbfd8b106639bb1ff2d8131d365a8f0004f66b93b450148f67bd2',
    });
});

test('should create a session key', async () => {
    const keyPairA = {
        publicKey:
            '0xdd6f2cfa0abb0363b3f9c0745089231a521ceb2724e486af141a19fe6aecd001',
        privateKey:
            '0x381b4c91252127056376d7bac73f7afa45ec43157f4b8a8726831fe7f106d5d3',
    };
    const keyPairB = {
        publicKey:
            '0x0b98425371671c3ecb6b3d2df0edf7a45e9c764366ea30c4e8b3a5ae12445077',
        privateKey:
            '0xf607f7fdf72fb42c52654eec99c4a277a8111ae45e63fa4110cd66b9529bf468',
    };

    const sharedA =
        '0x6a414ec540bdeea38fb3923b3facbb48783b26c4c80e116e790962a8ebe54078';
    const sharedB =
        '0xda2af4cb4dcaf79cac91186c4b6b0b4d45ded7bf2af1d59cf47abfdca7a6ffa5';

    const sessionKeyA = await createSenderSessionKey(
        keyPairA,
        keyPairB.publicKey,
    );
    expect(sessionKeyA).toEqual({
        sharedRx: sharedB,
        sharedTx: sharedA,
    });
    const sessionKeyB = await createReceiverSessionKey(
        keyPairB,
        keyPairA.publicKey,
    );
    expect(sessionKeyB).toEqual({
        sharedRx: sharedA,
        sharedTx: sharedB,
    });
});
