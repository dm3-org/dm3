import { ethers } from 'ethers';
import { createStorageKey, getStorageKeyCreationMessage } from '../../crypto';
import { createProfileKeys } from './createProfileKeys';

test(`Should create keys`, async () => {
    expect.assertions(1);
    const nonce = 0;

    const wallet = new ethers.Wallet(
        '0xac58f2f021d6f148fd621b355edbd0ebadcf9682019015ef1219cf9c0c2ddc8b',
    );

    const nonceMsg = getStorageKeyCreationMessage(nonce);
    const signedMessage = await wallet.signMessage(nonceMsg);

    const keys = await createProfileKeys(
        await createStorageKey(signedMessage),
        nonce,
    );

    expect(keys).toEqual({
        encryptionKeyPair: {
            publicKey:
                '0x5712222da4730a8b4e05abf77b0c6da5fe35529af7ca73bc3b3035edb2f78a34',
            privateKey:
                '0xf541d3971d80aa9f25165f1903a744f029f851d94c904508b0bf09f2348e6a3a',
        },
        signingKeyPair: {
            publicKey:
                '0xe89596dfa661a6da0c78874cb9d98a6dac42bfa2030269f750072ba6c18288e4',
            privateKey:
                '0x3ccb73f3b04c0b1af86a472a1b51fcf779f114298838ce8f3650799484be4f6f' +
                'e89596dfa661a6da0c78874cb9d98a6dac42bfa2030269f750072ba6c18288e4',
        },
        storageEncryptionKey:
            '0x3ccb73f3b04c0b1af86a472a1b51fcf779f114298838ce8f3650799484be4f6f',
        storageEncryptionNonce: 0,
    });
});
