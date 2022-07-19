// From https://github.com/dchest/tweetnacl-js/wiki/Examples

import { ethers } from 'ethers';
import { secretbox, randomBytes } from 'tweetnacl';
import {
    decodeUTF8,
    encodeUTF8,
    encodeBase64,
    decodeBase64,
} from 'tweetnacl-util';
import { PersonalSign } from '../external-apis/InjectedWeb3API';
import { Connection } from '../web3-provider/Web3Provider';

generateSymmetricalKey();

export async function getSymmetricalKeyFromSignature(
    connection: Partial<Connection>,
    personalSign: PersonalSign,
    salt?: string,
): Promise<{
    symmetricalKey: string;
    symmetricalKeySalt: string;
}> {
    if (!connection.provider) {
        throw Error('No provider');
    }
    if (!connection.account) {
        throw Error('No account');
    }
    const symmetricalKeySalt =
        salt ??
        `Sign this to retrieve your dm3 encryption key.\n\nSalt:${encodeBase64(
            randomBytes(secretbox.keyLength),
        )}`;
    const signature = await personalSign(
        connection.provider,
        connection.account.address,
        symmetricalKeySalt,
    );

    return {
        symmetricalKey: generateSymmetricalKey(
            ethers.utils.arrayify(ethers.utils.keccak256(signature)),
        ),
        symmetricalKeySalt,
    };
}
export type GetSymmetricalKeyFromSignature =
    typeof getSymmetricalKeyFromSignature;

export function generateSymmetricalKey(seed?: Uint8Array) {
    return seed
        ? encodeBase64(seed)
        : encodeBase64(randomBytes(secretbox.keyLength));
}

function newNonce() {
    return randomBytes(secretbox.nonceLength);
}

export function symmetricalEncrypt(json: any, key: string) {
    const keyUint8Array = decodeBase64(key);

    const nonce = newNonce();
    const messageUint8 = decodeUTF8(JSON.stringify(json));
    const box = secretbox(messageUint8, nonce, keyUint8Array);

    const fullMessage = new Uint8Array(nonce.length + box.length);
    fullMessage.set(nonce);
    fullMessage.set(box, nonce.length);

    const base64FullMessage = encodeBase64(fullMessage);
    return base64FullMessage;
}

export function symmetricalDecrypt(messageWithNonce: string, key: string) {
    const keyUint8Array = decodeBase64(key);
    const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce);
    const nonce = messageWithNonceAsUint8Array.slice(0, secretbox.nonceLength);
    const message = messageWithNonceAsUint8Array.slice(
        secretbox.nonceLength,
        messageWithNonce.length,
    );

    const decrypted = secretbox.open(message, nonce, keyUint8Array);

    if (!decrypted) {
        throw new Error('Could not decrypt message');
    }

    const base64DecryptedMessage = encodeUTF8(decrypted);
    return JSON.parse(base64DecryptedMessage);
}
