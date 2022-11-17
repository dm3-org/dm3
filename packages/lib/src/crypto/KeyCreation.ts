import { ethers } from 'ethers';
import { sha256 } from 'ethers/lib/utils';
import _sodium from 'libsodium-wrappers';

export interface KeyPair {
    publicKey: string;
    privateKey: string;
}

export interface SessionKey {
    sharedRx: string;
    sharedTx: string;
}

export async function createSigningKeyPair(seed?: string): Promise<KeyPair> {
    await _sodium.ready;
    const sodium = _sodium;
    const keys = seed
        ? sodium.crypto_sign_seed_keypair(ethers.utils.arrayify(seed))
        : sodium.crypto_sign_keypair();

    return {
        publicKey: ethers.utils.hexlify(keys.publicKey),
        privateKey: ethers.utils.hexlify(keys.privateKey),
    };
}

export function getStorageKeyCreationMessage(nonce: number) {
    return `Sign this to retrieve your dm3 encryption key.\nNonce: ${nonce}`;
}

export async function createStorageKey(
    creationMessageSig: string,
): Promise<string> {
    return sha256(ethers.utils.toUtf8Bytes(creationMessageSig));
}

export async function createKeyPair(seed?: string): Promise<KeyPair> {
    await _sodium.ready;
    const sodium = _sodium;
    const keys = seed
        ? sodium.crypto_kx_seed_keypair(ethers.utils.arrayify(seed))
        : sodium.crypto_kx_keypair();

    return {
        publicKey: ethers.utils.hexlify(keys.publicKey),
        privateKey: ethers.utils.hexlify(keys.privateKey),
    };
}

export async function createSenderSessionKey(
    keyPair: KeyPair,
    externalPublicKey: string,
): Promise<SessionKey> {
    await _sodium.ready;
    const sodium = _sodium;
    const sessionKey = sodium.crypto_kx_client_session_keys(
        ethers.utils.arrayify(keyPair.publicKey),
        ethers.utils.arrayify(keyPair.privateKey),
        ethers.utils.arrayify(externalPublicKey),
    );

    return {
        sharedRx: ethers.utils.hexlify(sessionKey.sharedRx),
        sharedTx: ethers.utils.hexlify(sessionKey.sharedTx),
    };
}

export async function createReceiverSessionKey(
    keyPair: KeyPair,
    externalPublicKey: string,
): Promise<SessionKey> {
    await _sodium.ready;
    const sodium = _sodium;
    const sessionKey = sodium.crypto_kx_server_session_keys(
        ethers.utils.arrayify(keyPair.publicKey),
        ethers.utils.arrayify(keyPair.privateKey),
        ethers.utils.arrayify(externalPublicKey),
    );

    return {
        sharedRx: ethers.utils.hexlify(sessionKey.sharedRx),
        sharedTx: ethers.utils.hexlify(sessionKey.sharedTx),
    };
}
