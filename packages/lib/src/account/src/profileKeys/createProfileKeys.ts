import { createKeyPair, createSigningKeyPair } from 'dm3-lib-crypto';
import { ProfileKeys } from '../Account';

export async function createProfileKeys(
    nonceMsgSig: string,
    nonce: number,
): Promise<ProfileKeys> {
    return {
        encryptionKeyPair: await createKeyPair(nonceMsgSig),
        signingKeyPair: await createSigningKeyPair(nonceMsgSig),
        storageEncryptionKey: nonceMsgSig,
        storageEncryptionNonce: nonce,
    };
}
