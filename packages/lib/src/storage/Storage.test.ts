import { sync } from './Storage';

test(`Should throw if userDb isn't set`, async () => {
    expect.assertions(1);
    await expect(() => sync(undefined)).rejects.toEqual(
        Error(`User db hasn't been create`),
    );
});
