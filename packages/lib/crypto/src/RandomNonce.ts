import { ethers } from 'ethers';
import _sodium from 'libsodium-wrappers';
import { initializeLibSodiumWrapper } from './libsodium/initializeLibSodiumWrapper';

export async function getRandomNonce(): Promise<string> {
    const sodium = await initializeLibSodiumWrapper();

    const nonce = ethers.utils.hexlify(
        sodium.randombytes_buf(
            sodium.crypto_aead_chacha20poly1305_IETF_NPUBBYTES,
        ),
    );

    return nonce;
}
