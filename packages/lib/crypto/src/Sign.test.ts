import { ethers } from 'ethers';
import { checkSignature, sign } from './Sign';

const keyA = {
    publicKey: '7nrQDPEY/u4qOfBJn1kplfygllX2Vv1AfUo2AMuC45M=',
    privateKey:
        'fxIyJnMWNyzEma5dTFIgFEHbMhOcUZ1iq6pQN12r4cnuetAM8Rj+7io58EmfWSmV/KCWVfZW/UB9SjYAy4Ljkw==',
};

test('should sign a payload', async () => {
    const sig = await sign(keyA.privateKey, 'test');
    expect(sig).toEqual(
        '9x18lnf1Dp65hseNuL8M9LL8x4kYy3ci2uMF3ncScD93jwdExjBBSPM0s3b4+2+6LEeLZECX1+bUE/usUqakAA==',
    );
});

test('should accecpt a correct signature', async () => {
    expect(
        await checkSignature(
            keyA.publicKey,
            'test',
            '9x18lnf1Dp65hseNuL8M9LL8x4kYy3ci2uMF3ncScD93jwdExjBBSPM0s3b4+2+6LEeLZECX1+bUE/usUqakAA==',
        ),
    ).toEqual(true);
});

test('should reject a manipulated payload', async () => {
    expect(
        await checkSignature(
            keyA.publicKey,
            'test1',
            '9x18lnf1Dp65hseNuL8M9LL8x4kYy3ci2uMF3ncScD93jwdExjBBSPM0s3b4+2+6LEeLZECX1+bUE/usUqakAA==',
        ),
    ).toEqual(false);
});
