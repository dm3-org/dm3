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
        ? sodium.crypto_sign_seed_keypair(ethers.utils.base64.decode(seed))
        : sodium.crypto_sign_keypair();

    return {
        publicKey: ethers.utils.base64.encode(keys.publicKey),
        privateKey: ethers.utils.base64.encode(keys.privateKey),
    };
}

export function getStorageKeyCreationMessage(nonce: number) {
    return `Sign this to retrieve your dm3 encryption key.\nNonce: ${nonce}`;
}

export async function createStorageKey(
    creationMessageSig: string,
): Promise<string> {
    return ethers.utils.base64.encode(
        ethers.utils.arrayify(
            sha256(ethers.utils.toUtf8Bytes(creationMessageSig)),
        ),
    );
}

export async function createKeyPair(seed?: string): Promise<KeyPair> {
    await _sodium.ready;
    const sodium = _sodium;
    const keys = seed
        ? sodium.crypto_kx_seed_keypair(ethers.utils.base64.decode(seed))
        : sodium.crypto_kx_keypair();

    return {
        publicKey: ethers.utils.base64.encode(keys.publicKey),
        privateKey: ethers.utils.base64.encode(keys.privateKey),
    };
}

export async function createSenderSessionKey(
    keyPair: KeyPair,
    externalPublicKey: string,
): Promise<SessionKey> {
    await _sodium.ready;
    const sodium = _sodium;
    const sessionKey = sodium.crypto_kx_client_session_keys(
        ethers.utils.base64.decode(keyPair.publicKey),
        ethers.utils.base64.decode(keyPair.privateKey),
        ethers.utils.base64.decode(externalPublicKey),
    );

    return {
        sharedRx: ethers.utils.base64.encode(sessionKey.sharedRx),
        sharedTx: ethers.utils.base64.encode(sessionKey.sharedTx),
    };
}

export async function createReceiverSessionKey(
    keyPair: KeyPair,
    externalPublicKey: string,
): Promise<SessionKey> {
    await _sodium.ready;
    const sodium = _sodium;
    const sessionKey = sodium.crypto_kx_server_session_keys(
        ethers.utils.base64.decode(keyPair.publicKey),
        ethers.utils.base64.decode(keyPair.privateKey),
        ethers.utils.base64.decode(externalPublicKey),
    );

    return {
        sharedRx: ethers.utils.base64.encode(sessionKey.sharedRx),
        sharedTx: ethers.utils.base64.encode(sessionKey.sharedTx),
    };
}
