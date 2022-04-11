import { sync } from './Storage';

test(`Should throw if userDb isn't set`, async () => {
    expect(() => sync(undefined)).toThrow(`User db hasn't been create`);
});
