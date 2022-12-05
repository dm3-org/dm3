import { ethers } from 'ethers';
import _sodium from 'libsodium-wrappers';
import { checkSignature, sign } from './Sign';

const keyA = {
    publicKey: '7nrQDPEY/u4qOfBJn1kplfygllX2Vv1AfUo2AMuC45M=',
    privateKey:
        'fxIyJnMWNyzEma5dTFIgFEHbMhOcUZ1iq6pQN12r4cnuetAM8Rj+7io58EmfWSmV/KCWVfZW/UB9SjYAy4Ljkw==',
};

test('should sign a payload', async () => {
    const sig = await sign(keyA.privateKey, 'test');
    expect(sig).toEqual(
        '0xf71d7c9677f50e9eb986c78db8bf0cf4b2fcc78918cb7722dae305d' +
            'e7712703f778f0744c6304148f334b376f8fb6fba2c478b644097d7e6d413fbac52a6a400',
    );
});

test('should accecpt a correct signature', async () => {
    expect(
        await checkSignature(
            keyA.publicKey,
            'test',
            '0xf71d7c9677f50e9eb986c78db8bf0cf4b2fcc78918cb7722dae305d' +
                'e7712703f778f0744c6304148f334b376f8fb6fba2c478b644097d7e6d413fbac52a6a400',
        ),
    ).toEqual(true);
});

test('should reject a manipulated payload', async () => {
    expect(
        await checkSignature(
            keyA.publicKey,
            'test1',
            '0xf71d7c9677f50e9eb986c78db8bf0cf4b2fcc78918cb7722dae305d' +
                'e7712703f778f0744c6304148f334b376f8fb6fba2c478b644097d7e6d413fbac52a6a400',
        ),
    ).toEqual(false);
});
