import { getDefaultProfileExtension } from './ProfileExtension';

test('should return the default profile extension', async () => {
    expect(getDefaultProfileExtension()).toStrictEqual({
        notSupportedMessageTypes: ['NEW'],
    });
});
