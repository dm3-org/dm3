//from: https://github.com/MetaMask/eth-sig-util/blob/main/src/encryption.ts
//@ts-ignore
import * as nacl from 'tweetnacl';
//@ts-ignore
import * as naclUtil from 'tweetnacl-util';
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import { EncryptionEnvelop, Envelop, Message } from '../messaging/Messaging';
import { log } from '../shared/log';
import { stringify } from '../shared/stringify';
import { Keys } from '../account/Account';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { UserDB } from '../storage/Storage';
export interface EthEncryptedData {
    version: string;
    nonce: string;
    ephemPublicKey: string;
    ciphertext: string;
}

function isNullish(value: any) {
    return value === null || value === undefined;
}

export function encrypt({
    publicKey,
    data,
    version,
}: {
    publicKey: string;
    data: unknown;
    version: string;
}): EthEncryptedData {
    if (isNullish(publicKey)) {
        throw new Error('Missing publicKey parameter');
    } else if (isNullish(data)) {
        throw new Error('Missing data parameter');
    } else if (isNullish(version)) {
        throw new Error('Missing version parameter');
    }

    switch (version) {
        case 'x25519-xsalsa20-poly1305': {
            if (typeof data !== 'string') {
                throw new Error('Message data must be given as a string');
            }
            // generate ephemeral keypair
            const ephemeralKeyPair = nacl.box.keyPair();

            // assemble encryption parameters - from string to UInt8
            let pubKeyUInt8Array;
            try {
                pubKeyUInt8Array = naclUtil.decodeBase64(publicKey);
            } catch (err) {
                log('[Encrypt ]' + err);
                throw new Error('Bad public key');
            }

            const msgParamsUInt8Array = naclUtil.decodeUTF8(data);
            const nonce = nacl.randomBytes(nacl.box.nonceLength);

            // encrypt
            const encryptedMessage = nacl.box(
                msgParamsUInt8Array,
                nonce,
                pubKeyUInt8Array,
                ephemeralKeyPair.secretKey,
            );

            // handle encrypted data
            const output = {
                version: 'x25519-xsalsa20-poly1305',
                nonce: naclUtil.encodeBase64(nonce),
                ephemPublicKey: naclUtil.encodeBase64(
                    ephemeralKeyPair.publicKey,
                ),
                ciphertext: naclUtil.encodeBase64(encryptedMessage),
            };
            // return encrypted msg data
            return output;
        }

        default:
            throw new Error('Encryption type/version not supported');
    }
}

export function encryptSafely({
    publicKey,
    data,
    version,
}: {
    publicKey: string;
    data: unknown;
    version: string;
}): EthEncryptedData {
    if (isNullish(publicKey)) {
        throw new Error('Missing publicKey parameter');
    } else if (isNullish(data)) {
        throw new Error('Missing data parameter');
    } else if (isNullish(version)) {
        throw new Error('Missing version parameter');
    }

    const DEFAULT_PADDING_LENGTH = 2 ** 11;
    const NACL_EXTRA_BYTES = 16;

    if (typeof data === 'object' && 'toJSON' in (data as object)) {
        // remove toJSON attack vector
        // TODO, check all possible children
        throw new Error(
            'Cannot encrypt with toJSON property.  Please remove toJSON property',
        );
    }

    // add padding
    const dataWithPadding = {
        data,
        padding: '',
    };

    // calculate padding
    const dataLength = Buffer.byteLength(stringify(dataWithPadding), 'utf-8');
    const modVal = dataLength % DEFAULT_PADDING_LENGTH;
    let padLength = 0;
    // Only pad if necessary
    if (modVal > 0) {
        padLength = DEFAULT_PADDING_LENGTH - modVal - NACL_EXTRA_BYTES; // nacl extra bytes
    }
    dataWithPadding.padding = '0'.repeat(padLength);

    const paddedMessage = stringify(dataWithPadding);
    return encrypt({ publicKey, data: paddedMessage, version });
}
export type EncryptSafely = typeof encryptSafely;

/**
 * Decrypt a message.
 *
 * @param options - The decryption options.
 * @param options.encryptedData - The encrypted data.
 * @param options.privateKey - The private key to decrypt with.
 * @returns The decrypted message.
 */
export function decrypt({
    encryptedData,
    privateKey,
}: {
    encryptedData: EthEncryptedData;
    privateKey: string;
}): string {
    if (isNullish(encryptedData)) {
        throw new Error('Missing encryptedData parameter');
    } else if (isNullish(privateKey)) {
        throw new Error('Missing privateKey parameter');
    }

    switch (encryptedData.version) {
        case 'x25519-xsalsa20-poly1305': {
            // string to buffer to UInt8Array
            const recieverPrivateKeyUint8Array = nacl_decodeHex(privateKey);
            const recieverEncryptionPrivateKey = nacl.box.keyPair.fromSecretKey(
                recieverPrivateKeyUint8Array,
            ).secretKey;

            // assemble decryption parameters
            const nonce = naclUtil.decodeBase64(encryptedData.nonce);
            const ciphertext = naclUtil.decodeBase64(encryptedData.ciphertext);
            const ephemPublicKey = naclUtil.decodeBase64(
                encryptedData.ephemPublicKey,
            );

            // decrypt
            const decryptedMessage = nacl.box.open(
                ciphertext,
                nonce,
                ephemPublicKey,
                recieverEncryptionPrivateKey,
            );

            // return decrypted msg data
            let output;
            try {
                output = naclUtil.encodeUTF8(decryptedMessage as Uint8Array);
            } catch (err) {
                throw new Error('Decryption failed.');
            }

            if (output) {
                return output;
            }
            throw new Error('Decryption failed.');
        }

        default:
            throw new Error('Encryption type/version not supported.');
    }
}

/**
 * Decrypt a message that has been encrypted using `encryptSafely`.
 *
 * @param options - The decryption options.
 * @param options.encryptedData - The encrypted data.
 * @param options.privateKey - The private key to decrypt with.
 * @returns The decrypted message.
 */
export function decryptSafely({
    encryptedData,
    privateKey,
}: {
    encryptedData: EthEncryptedData;
    privateKey: string;
}): unknown {
    if (isNullish(encryptedData)) {
        throw new Error('Missing encryptedData parameter');
    } else if (isNullish(privateKey)) {
        throw new Error('Missing privateKey parameter');
    }

    const dataWithPadding = JSON.parse(decrypt({ encryptedData, privateKey }));
    return dataWithPadding.data;
}

/**
 * Convert a hex string to the UInt8Array format used by nacl.
 *
 * @param msgHex - The string to convert.
 * @returns The converted string.
 */
function nacl_decodeHex(msgHex: string): Uint8Array {
    //const msgBase64 = Buffer.from(msgHex, 'hex').toString('base64');
    return naclUtil.decodeBase64(msgHex);
}

export function decryptPayload<T>(userDb: UserDB, payload: string): T {
    return {
        ...(decryptSafely({
            encryptedData: JSON.parse(ethers.utils.toUtf8String(payload)),
            privateKey: (userDb.keys as Keys).privateMessagingKey as string,
        }) as T),
    };
}

export function checkSignature(
    message: Message,
    publicSigningKey: string,
    accountAddress: string,
    signature: string,
): boolean {
    const isValid = nacl.sign.detached.verify(
        ethers.utils.toUtf8Bytes(stringify(message)),
        ethers.utils.arrayify(signature),
        nacl_decodeHex(publicSigningKey),
    );

    if (!isValid) {
        log(`Signature check for ${accountAddress} failed.`);
    }

    if (formatAddress(accountAddress) !== formatAddress(message.from)) {
        return false;
    } else {
        return isValid;
    }
}

export function signWithSignatureKey(message: any, keys: Keys): string {
    return ethers.utils.hexlify(
        nacl.sign.detached(
            ethers.utils.toUtf8Bytes(stringify(message)),
            naclUtil.decodeBase64(keys.privateSigningKey as string),
        ),
    );
}
export type SignWithSignatureKey = typeof signWithSignatureKey;
