import { ethers } from 'ethers';
import _sodium, { unpad } from 'libsodium-wrappers';
import {
    createKeyPair,
    createReceiverSessionKey,
    createSenderSessionKey,
    KeyPair,
} from './KeyCreation';

export interface EncryptedPayload {
    nonce: string;
    ciphertext: string;
    ephemPublicKey?: string;
}

const PAD_BLOCKSIZE = 2 ** 11;

export async function encrypt(
    key: string,
    payload: string,
    prevNonce?: string,
): Promise<EncryptedPayload> {
    await _sodium.ready;
    const sodium = _sodium;

    const nonce = prevNonce
        ? ethers.utils.arrayify(prevNonce)
        : sodium.randombytes_buf(
              sodium.crypto_aead_chacha20poly1305_IETF_NPUBBYTES,
          );

    if (prevNonce) {
        sodium.increment(ethers.utils.arrayify(nonce));
    }

    const paddedPayload = sodium.pad(
        ethers.utils.toUtf8Bytes(payload),
        PAD_BLOCKSIZE,
    );

    const encryptedPayload = sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
        paddedPayload,
        null,
        null,
        nonce,
        ethers.utils.arrayify(key),
    );

    return {
        ciphertext: ethers.utils.hexlify(encryptedPayload),
        nonce: ethers.utils.hexlify(nonce),
    };
}

export async function decrypt(
    key: string,
    encryptedPayload: EncryptedPayload,
): Promise<string> {
    await _sodium.ready;
    const sodium = _sodium;

    const payload = sodium.crypto_aead_chacha20poly1305_ietf_decrypt(
        null,
        ethers.utils.arrayify(encryptedPayload.ciphertext),
        null,
        ethers.utils.arrayify(encryptedPayload.nonce),
        ethers.utils.arrayify(key),
    );

    const unpadded = sodium.unpad(payload, PAD_BLOCKSIZE);

    return ethers.utils.toUtf8String(unpadded);
}

export async function encryptAsymmetric(
    externalPublicKey: string,
    payload: string,
): Promise<EncryptedPayload> {
    const ephemeralKeyPair = await createKeyPair();
    const sessionKey = await createSenderSessionKey(
        ephemeralKeyPair,
        externalPublicKey,
    );

    const encryptedPayload = await encrypt(sessionKey.sharedTx, payload);

    return {
        ...encryptedPayload,
        ephemPublicKey: ephemeralKeyPair.publicKey,
    };
}
export type EncryptAsymmetric = typeof encryptAsymmetric;

export async function decryptAsymmetric(
    ownEncryptionKeyPair: KeyPair,
    encryptedPayload: EncryptedPayload,
): Promise<string> {
    if (!encryptedPayload.ephemPublicKey) {
        throw Error('ephemPublicKey is missing');
    }
    const sessionKey = await createReceiverSessionKey(
        ownEncryptionKeyPair,
        encryptedPayload.ephemPublicKey,
    );
    return decrypt(sessionKey.sharedRx, encryptedPayload);
}
export type DecryptAsymmetric = typeof decryptAsymmetric;
