import { ethers } from 'ethers';
import {
    createStorageKey,
    getStorageKeyCreationMessage,
} from '@dm3-org/dm3-lib-crypto';
import { createProfileKeys } from './createProfileKeys';
import { DEFAULT_NONCE } from '../Profile';

test(`Should create keys`, async () => {
    expect.assertions(1);
    const nonce = DEFAULT_NONCE;

    const wallet = new ethers.Wallet(
        '0xac58f2f021d6f148fd621b355edbd0ebadcf9682019015ef1219cf9c0c2ddc8b',
    );

    const nonceMsg = getStorageKeyCreationMessage(nonce, wallet.address);
    const signedMessage = await wallet.signMessage(nonceMsg);

    const keys = await createProfileKeys(
        await createStorageKey(signedMessage),
        nonce,
    );

    expect(keys).toEqual({
        encryptionKeyPair: {
            privateKey: 'dradnyjzlC7T87nZ3HfJo+w2aQQVhxP0Sdk+eZttEmw=',
            publicKey: 'Cz5WfEEhkmzP52L7OJzd4sf9xQUYc9nRAbnevjTbL28=',
        },
        signingKeyPair: {
            privateKey:
                'hHFeMBtp9mkqrPPSRVbgQU9KMj/K/1zvjjBJ7kcD25i/ACwK7hMAvcp54J+QqyL4AJNGN94e1somHjJSz18vkA==',
            publicKey: 'vwAsCu4TAL3KeeCfkKsi+ACTRjfeHtbKJh4yUs9fL5A=',
        },
        storageEncryptionKey: 'hHFeMBtp9mkqrPPSRVbgQU9KMj/K/1zvjjBJ7kcD25g=',
        storageEncryptionNonce:
            '0xa1b38837dd52e70a250ac2bf3e19f1599833e9d30662bf69a1c12e5747ed9f65',
    });
});
