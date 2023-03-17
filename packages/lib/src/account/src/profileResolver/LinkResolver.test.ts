import { LinkResolver } from './LinkResolver';

test('should throw if profile could not be loaded', async () => {
    await expect(
        LinkResolver(
            async () => undefined,
            () => true,
        ).resolveProfile(''),
    ).rejects.toEqual(Error(`Could not load profile`));
});

test('should throw if profile does not fit schema', async () => {
    await expect(
        LinkResolver(
            async () => ({} as any),
            () => false,
        ).resolveProfile(''),
    ).rejects.toEqual(Error(`SignedUserProfileSchema doesn't fit schema`));
});

test('should throw if profile hash check fails', async () => {
    await expect(
        LinkResolver(
            async () => ({} as any),
            () => true,
        ).resolveProfile(''),
    ).rejects.toEqual(Error(`Profile hash check failed`));
});
