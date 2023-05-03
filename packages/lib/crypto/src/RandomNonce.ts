import { ethers } from 'ethers';
import _sodium from 'libsodium-wrappers';

export async function getRandomNonce(): Promise<string> {
    await _sodium.ready;
    const sodium = _sodium;

    const nonce = ethers.utils.hexlify(
        sodium.randombytes_buf(
            sodium.crypto_aead_chacha20poly1305_IETF_NPUBBYTES,
        ),
    );

    return nonce;
}
