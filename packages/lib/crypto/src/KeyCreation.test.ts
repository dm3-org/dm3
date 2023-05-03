import { ethers } from 'ethers';
import {
    createKeyPair,
    createReceiverSessionKey,
    createSenderSessionKey,
    createSigningKeyPair,
    createStorageKey,
    getStorageKeyCreationMessage,
} from './KeyCreation';

test('should get a correct storage key creation message', async () => {
    const message = await getStorageKeyCreationMessage('99');
    expect(message).toEqual(
        'Connect the dm3 app with your wallet.' +
            ' Keys for secure communication are derived from the signature.' +
            ' No paid transaction will be executed.\nNonce: 99',
    );
});

test('should get a correct storage key', async () => {
    const sig =
        '0xb9b0a77f501c6db70c5e8f7d1e6be1642b8b7e897d681c69921569cb84b0a' +
        '87d52cd22d501de45a643d4058bdba96d5614faf7dc4461a5931fc90ddecb2e84991b';
    const key = await createStorageKey(sig);
    expect(key).toEqual('hsFAngifN8jSBFkrVKL1NgWKLCbLYJHKLTdr6LPxlqQ=');
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
        '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=',
    );
    expect(keyPair).toEqual({
        publicKey: 'eHmMq29FeiPKfNPkSctPuZGXvV0sKeO/KZkX2nXvMgw=',
        privateKey: 'pMI77F2w3GK+omZCB4A61WDqISOOnWGXR2f/MTLbqbY=',
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
        '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=',
    );
    expect(keyPair).toEqual({
        publicKey: '+tkDQWZfv9ixBmObsf8tgTHTZajwAE9muTtFAUj2e9I=',
        privateKey:
            '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJX62QNBZl+/2LEGY5ux/y2BMdNlqPAAT2a5O0UBSPZ70g==',
    });
});

test('should create a session key', async () => {
    const keyPairA = {
        publicKey: '3W8s+gq7A2Oz+cB0UIkjGlIc6yck5IavFBoZ/mrs0AE=',
        privateKey: 'OBtMkSUhJwVjdte6xz96+kXsQxV/S4qHJoMf5/EG1dM=',
    };
    const keyPairB = {
        publicKey: 'C5hCU3FnHD7Laz0t8O33pF6cdkNm6jDE6LOlrhJEUHc=',
        privateKey: '9gf3/fcvtCxSZU7smcSid6gRGuReY/pBEM1muVKb9Gg=',
    };

    const sharedA = 'akFOxUC97qOPs5I7P6y7SHg7JsTIDhFueQliqOvlQHg=';
    const sharedB = '2ir0y03K95yskRhsS2sLTUXe178q8dWc9Hq/3Kem/6U=';

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
