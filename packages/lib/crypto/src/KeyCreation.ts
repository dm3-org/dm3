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

export function getStorageKeyCreationMessage(nonce: string, address: string) {
    // TODO: during linked profile implementation these values should be fetched from env
    const statement =
        `Connect the DM3 MESSENGER with your wallet. ` +
        `Keys for secure communication are derived from this signature.\n\n` +
        `(There is no paid transaction initiated. The signature is used off-chain only.)`;
    const domain = 'dm3.chat';
    const uri = 'https://dm3.chat';
    const version = '1';

    return (
        `${domain} wants you to sign in with your Ethereum account:\n` +
        `${ethers.utils.getAddress(address)}\n\n` +
        `${statement}\n\n` +
        `URI: ${uri}\n` +
        `Version: ${version}\n` +
        `Nonce: ${nonce}`
    );
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
