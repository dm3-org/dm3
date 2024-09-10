import { resolveProfile } from './IpfsResolver';

test('should throw if profile could not be loaded', async () => {
    await expect(
        resolveProfile(
            async () => undefined,
            () => true,
        )(''),
    ).rejects.toEqual(Error(`Could not load profile`));
});

test('should throw if profile does not fit schema', async () => {
    await expect(
        resolveProfile(
            async () => ({} as any),
            () => false,
        )(''),
    ).rejects.toEqual(Error(`SignedUserProfileSchema doesn't fit schema`));
});
