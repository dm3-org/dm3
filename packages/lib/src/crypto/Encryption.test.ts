import { ethers } from 'ethers';
import {
    decrypt,
    decryptAsymmetric,
    encrypt,
    encryptAsymmetric,
    EncryptedPayload,
} from './Encryption';

import * as Encrypted from './Encryption.test.json';

const keyA = {
    publicKey: 'x131spvZZX6mDTIniaUN5N27or8XlllvasXb9myGvXQ=',
    privateKey: 'uDcUwbIDrLF4gd70nzYz3KdmK4i6rrEr191vofBbDQI=',
};

const keyB = '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=';

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

test('should decrypt correctly', async () => {
    expect(await decrypt(keyB, Encrypted.testDataA)).toEqual('test');
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
    const decrypted = await decryptAsymmetric(keyA, Encrypted.testDataB);
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
