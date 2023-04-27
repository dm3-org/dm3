import { ethers } from 'ethers';
import { JsonResolver } from './JsonResolver';

test('should accept correct data URI and types', () => {
    const data = JSON.stringify({ test: 'test' });
    expect(
        JsonResolver(() => true).isProfile('data:application/json,' + data),
    ).toEqual(true);
});

test('should throw if data URI could not be parsed', async () => {
    await expect(JsonResolver(() => false).resolveProfile('')).rejects.toEqual(
        Error(`Couldn't parse data uri`),
    );
});

test('should reject wrong type', () => {
    const data = JSON.stringify({ test: 'test' });
    expect(
        JsonResolver(() => true).isProfile('data:text/json,' + data),
    ).toEqual(false);
});

test('should reject wrong subtype', () => {
    const data = JSON.stringify({ test: 'test' });
    expect(
        JsonResolver(() => true).isProfile('data:application/xml,' + data),
    ).toEqual(false);
});

test('should reject wrong protocol', () => {
    const data = JSON.stringify({ test: 'test' });
    expect(
        JsonResolver(() => true).isProfile('http:application/xml,' + data),
    ).toEqual(false);
});

test('should parse profile', async () => {
    const data = JSON.stringify({ test: 'test' });
    expect(
        await JsonResolver(() => true).resolveProfile(
            'data:application/xml,' + data,
        ),
    ).toEqual({ test: 'test' });
});

test('should throw if validation fails', async () => {
    const data = JSON.stringify({ test: 'test' });
    expect.assertions(1);

    await expect(
        JsonResolver(() => false).resolveProfile(
            'data:application/xml,' + data,
        ),
    ).rejects.toEqual(Error(`Profile doesn't fit schema`));
});

test('should support base64', async () => {
    const data = JSON.stringify({ test: 'test' });
    expect(
        await JsonResolver(() => true).resolveProfile(
            'data:application/json;base64,' +
                ethers.utils.base64.encode(ethers.utils.toUtf8Bytes(data)),
        ),
    ).toEqual({ test: 'test' });
});
