import { ethers } from 'ethers';
import { createStorageKey, getStorageKeyCreationMessage } from 'dm3-lib-crypto';
import { createProfileKeys } from './createProfileKeys';

test(`Should create keys`, async () => {
    expect.assertions(1);
    const nonce = '0';

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
            privateKey: '0wMyWrdDXCfuwRq4nm6IHqZ7hMbPOb5DsTt1C85w+zE=',
            publicKey: 'JBvXxZY4BOnKK4J2s42ZpAJaFd/nmB5Sq7EB+jfA6H8=',
        },
        signingKeyPair: {
            privateKey:
                'ti4w8V+E6x4Z63XIMA9ZM0lXKhMjTaxP/qjARC8c4CxRQS5qo2AEYU+ZeFyB0bksaPBX1K5/QA/dregbbmFgQQ==',
            publicKey: 'UUEuaqNgBGFPmXhcgdG5LGjwV9Suf0AP3a3oG25hYEE=',
        },
        storageEncryptionKey: 'ti4w8V+E6x4Z63XIMA9ZM0lXKhMjTaxP/qjARC8c4Cw=',
        storageEncryptionNonce: '0',
    });
});
