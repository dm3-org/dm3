import _sodium from 'libsodium-wrappers';
import { checkSignature, sign } from './Sign';

const keyA = {
    publicKey:
        '0xee7ad00cf118feee2a39f0499f592995fca09655f656fd407d4a3600cb82e393',
    privateKey:
        '0x7f1232267316372cc499ae5d4c52201441db32139c519d62abaa50375dabe1c9e' +
        'e7ad00cf118feee2a39f0499f592995fca09655f656fd407d4a3600cb82e393',
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
