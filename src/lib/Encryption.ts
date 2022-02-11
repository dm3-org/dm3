//from: https://github.com/MetaMask/eth-sig-util/blob/main/src/encryption.ts
//@ts-ignore
import * as nacl from 'tweetnacl';
//@ts-ignore
import * as naclUtil from 'tweetnacl-util';
import { Buffer } from 'buffer';

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
    const dataLength = Buffer.byteLength(
        JSON.stringify(dataWithPadding),
        'utf-8',
    );
    const modVal = dataLength % DEFAULT_PADDING_LENGTH;
    let padLength = 0;
    // Only pad if necessary
    if (modVal > 0) {
        padLength = DEFAULT_PADDING_LENGTH - modVal - NACL_EXTRA_BYTES; // nacl extra bytes
    }
    dataWithPadding.padding = '0'.repeat(padLength);

    const paddedMessage = JSON.stringify(dataWithPadding);
    return encrypt({ publicKey, data: paddedMessage, version });
}
