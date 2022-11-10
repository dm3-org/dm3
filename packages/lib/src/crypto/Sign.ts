import { ethers } from 'ethers';
import _sodium from 'libsodium-wrappers';

export async function sign(
    privateKey: string,
    payloadToSign: string,
): Promise<string> {
    await _sodium.ready;
    const sodium = _sodium;
    return ethers.utils.hexlify(
        sodium.crypto_sign_detached(
            ethers.utils.toUtf8Bytes(payloadToSign),
            ethers.utils.arrayify(privateKey),
        ),
    );
}
export type Sign = typeof sign;

export async function checkSignature(
    publicKey: string,
    signedPayload: string,
    signature: string,
): Promise<boolean> {
    await _sodium.ready;
    const sodium = _sodium;
    return sodium.crypto_sign_verify_detached(
        ethers.utils.arrayify(signature),
        ethers.utils.toUtf8Bytes(signedPayload),
        ethers.utils.arrayify(publicKey),
    );
}
