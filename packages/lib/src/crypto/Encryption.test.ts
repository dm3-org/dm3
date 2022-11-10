import {
    decrypt,
    decryptAsymmetric,
    encrypt,
    encryptAsymmetric,
    EncryptedPayload,
} from './Encryption';

const keyA = {
    publicKey:
        '0xc75df5b29bd9657ea60d322789a50de4ddbba2bf1796596f6ac5dbf66c86bd74',
    privateKey:
        '0xb83714c1b203acb17881def49f3633dca7662b88baaeb12bd7dd6fa1f05b0d02',
};

const keyB =
    '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb895';

test('should encrypt a string symetric', async () => {
    const encryptedA = await encrypt(keyB, 'test');
    expect(encryptedA).toEqual(
        expect.objectContaining({
            ciphertext: expect.any(String),
            nonce: expect.any(String),
        }),
    );

    const encryptedB = await encrypt(keyB, 'test');
    expect(encryptedB).not.toEqual(encryptedA);
});

test('should encrypt to same ciphertext with same nonce', async () => {
    const encryptedA = await encrypt(
        keyB,
        'test',
        '0xb1aa67ea26d152dfdc60c0ce',
    );
    expect(encryptedA).toEqual(
        expect.objectContaining({
            ciphertext: expect.any(String),
            nonce: expect.any(String),
        }),
    );

    const encryptedB = await encrypt(
        keyB,
        'test',
        '0xb1aa67ea26d152dfdc60c0ce',
    );
    expect(encryptedB).toEqual(encryptedA);
});

test('should dencrypt correctly', async () => {
    const encrypted: EncryptedPayload = {
        ciphertext: '0xbcf6f9fc6754dc9a76be49dea394e2afa737cbb7',
        nonce: '0x2ee06c9483bba6eefabfecc9',
    };

    expect(await decrypt(keyB, encrypted)).toEqual('test');
});

test('should encrypt a string asymetric', async () => {
    const encrypted = await encryptAsymmetric(keyA.publicKey, 'test');

    expect(encrypted).toEqual(
        expect.objectContaining({
            ciphertext: expect.any(String),
            ephemPublicKey: expect.any(String),
            nonce: expect.any(String),
        }),
    );
});

test('should decrypt asymetric', async () => {
    const payload: EncryptedPayload = {
        ciphertext: '0x7a3108d2c144a7c623508963036c3aaa0cc1fa3a',
        nonce: '0xd5ac94e1b63aee44cd11c233',
        ephemPublicKey:
            '0x1e1460a0ed4291ae2eae124c4f49e85f10eb242069b88593cddfd31b3f5ca107',
    };

    const decrypted = await decryptAsymmetric(keyA, payload);
    expect(decrypted).toEqual('test');
});

test('should throw if ephemPublicKey is missing', async () => {
    const payload: EncryptedPayload = {
        ciphertext: '0x7a3108d2c144a7c623508963036c3aaa0cc1fa3a',
        nonce: '0xd5ac94e1b63aee44cd11c233',
    };

    expect.assertions(1);

    await expect(() => decryptAsymmetric(keyA, payload)).rejects.toEqual(
        Error('ephemPublicKey is missing'),
    );
});

test('should encrypte and decrypt asymetric correctly', async () => {
    const encryptedPayload = await encryptAsymmetric(keyA.publicKey, 'test');
    const decrypted = await decryptAsymmetric(keyA, encryptedPayload);
    expect(decrypted).toEqual('test');
});
