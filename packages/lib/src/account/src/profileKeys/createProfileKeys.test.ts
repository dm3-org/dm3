import { ethers } from 'ethers';
import { createStorageKey, getStorageKeyCreationMessage } from 'dm3-lib-crypto';
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
            publicKey: 'VxIiLaRzCotOBav3ewxtpf41Upr3ynO8OzA17bL3ijQ=',
            privateKey: '9UHTlx2Aqp8lFl8ZA6dE8Cn4UdlMkEUIsL8J8jSOajo=',
        },
        signingKeyPair: {
            publicKey: '6JWW36ZhptoMeIdMudmKbaxCv6IDAmn3UAcrpsGCiOQ=',
            privateKey:
                'PMtz87BMCxr4akcqG1H893nxFCmIOM6PNlB5lIS+T2/olZbfpmGm2gx4h0y52YptrEK/ogMCafdQByumwYKI5A==',
        },
        storageEncryptionKey: 'PMtz87BMCxr4akcqG1H893nxFCmIOM6PNlB5lIS+T28=',
        storageEncryptionNonce: 0,
    });
});
