import { MutableProfileExtension } from './MutableProfileExtension';
import { resolveMutableProfileExtension } from './resolveMutableProfileExtension';

describe('resolveProfileExtension', () => {
    it('Retuns MutableProfileExtension if url retruns proper json', async () => {
        const url = 'www.foo.io';

        const getResource = (_: string) => Promise.resolve({ minNonce: '1' });

        const resolved = await resolveMutableProfileExtension(url, getResource);

        expect(resolved).toStrictEqual({ minNonce: '1' });
    });
    it('Retuns undefined if the request to the url fails ', async () => {
        const url = 'www.foo.io';

        const getResource = (_: string) => Promise.resolve(undefined);

        const resolved = await resolveMutableProfileExtension(url, getResource);

        expect(resolved).toBeUndefined();
    });
    it('Retuns undefined if schema of MutableProfileExtension lookup is wrong', async () => {
        const url = 'www.foo.io';

        const getResource = (_: string) =>
            Promise.resolve({ foo: 'bar' } as MutableProfileExtension);

        const resolved = await resolveMutableProfileExtension(url, getResource);

        expect(resolved).toBeUndefined();
    });
});
