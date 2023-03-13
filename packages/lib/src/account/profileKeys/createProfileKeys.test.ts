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
            privateKey: 'g79U2C3cVkSHwrdDAF1klEdhdAtZXdspTBOoAohYPlQ=',
            publicKey: 'PKz2kFF0zqaWD4/vIMiADZmGKcf4tKo5/Wq9KDPlBlo=',
        },
        signingKeyPair: {
            publicKey: 'Z35n4cFXhCdDHmLwVPYHwHwiJlYr+Ga0dbPWj8/mxAE=',
            privateKey:
                'mxwp2Ygys2U3ary7cL0dDbh6TwYl3nEeDVzEaFS01NZnfmfhwVeEJ0MeYvBU9gfAfCImViv4ZrR1s9aPz+bEAQ==',
        },
        storageEncryptionKey: 'mxwp2Ygys2U3ary7cL0dDbh6TwYl3nEeDVzEaFS01NY=',
        storageEncryptionNonce: 0,
    });
});
