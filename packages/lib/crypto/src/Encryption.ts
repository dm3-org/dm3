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
    padding: number = PAD_BLOCKSIZE,
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
        padding,
    );

    const encryptedPayload = sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
        paddedPayload,
        null,
        null,
        nonce,
        ethers.utils.base64.decode(key),
    );

    return {
        ciphertext: ethers.utils.base64.encode(encryptedPayload),
        nonce: ethers.utils.hexlify(nonce),
    };
}

export async function decrypt(
    key: string,
    encryptedPayload: EncryptedPayload,
    padding: number = PAD_BLOCKSIZE,
): Promise<string> {
    await _sodium.ready;
    const sodium = _sodium;

    const payload = sodium.crypto_aead_chacha20poly1305_ietf_decrypt(
        null,
        ethers.utils.base64.decode(encryptedPayload.ciphertext),
        null,
        ethers.utils.arrayify(encryptedPayload.nonce),
        ethers.utils.base64.decode(key),
    );

    const unpadded = sodium.unpad(payload, padding);

    return ethers.utils.toUtf8String(unpadded);
}

export async function encryptAsymmetric(
    externalPublicKey: string,
    payload: string,
    padding: number = PAD_BLOCKSIZE,
): Promise<EncryptedPayload> {
    const ephemeralKeyPair = await createKeyPair();
    const sessionKey = await createSenderSessionKey(
        ephemeralKeyPair,
        externalPublicKey,
    );

    const encryptedPayload = await encrypt(
        sessionKey.sharedTx,
        payload,
        undefined,
        padding,
    );

    return {
        ...encryptedPayload,
        ephemPublicKey: ephemeralKeyPair.publicKey,
    };
}
export type EncryptAsymmetric = typeof encryptAsymmetric;

export async function decryptAsymmetric(
    ownEncryptionKeyPair: KeyPair,
    encryptedPayload: EncryptedPayload,
    padding: number = PAD_BLOCKSIZE,
): Promise<string> {
    if (!encryptedPayload.ephemPublicKey) {
        throw Error('ephemPublicKey is missing');
    }
    const sessionKey = await createReceiverSessionKey(
        ownEncryptionKeyPair,
        encryptedPayload.ephemPublicKey,
    );
    return decrypt(sessionKey.sharedRx, encryptedPayload, padding);
}
export type DecryptAsymmetric = typeof decryptAsymmetric;
