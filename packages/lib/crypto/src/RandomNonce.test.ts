import { getRandomNonce } from './RandomNonce';

test('should reject a manipulated payload', async () => {
    expect((await getRandomNonce()).length).toStrictEqual(26);
});
