import { getDeliveryServiceProperties } from './getDeliveryServiceProperties';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { stringify } from 'yaml';
import { resolve } from 'path';

describe('ReadDeliveryServiceProperties', () => {
    let path: string;
    beforeEach(() => {
        path = resolve(__dirname, './config.test.yml');
    });

    afterEach(() => {
        if (existsSync(path)) {
            unlinkSync(path);
        }
    });
    describe('Networks', () => {
        it('Returns config if yaml  Contains a network if url was specified', () => {
            writeFileSync(
                path,
                stringify({
                    messageTTL: 12345,
                    sizeLimit: 456,
                    networks: {
                        eth: { url: 'foo.io' },
                    },
                }),
                { encoding: 'utf-8' },
            );
            const config = getDeliveryServiceProperties(path);

            expect(config).toStrictEqual({
                messageTTL: 12345,
                sizeLimit: 456,
                networks: {
                    eth: { url: 'foo.io' },
                },
            });
        });
        it('Returns config if yaml  Contains a multiple networks', () => {
            writeFileSync(
                path,
                stringify({
                    messageTTL: 12345,
                    sizeLimit: 456,
                    networks: {
                        eth: { url: 'foo.io' },
                        cg: { url: 'bar.io' },
                    },
                }),
                { encoding: 'utf-8' },
            );
            const config = getDeliveryServiceProperties(path);

            expect(config).toStrictEqual({
                messageTTL: 12345,
                sizeLimit: 456,
                networks: {
                    eth: { url: 'foo.io' },
                    cg: { url: 'bar.io' },
                },
            });
        });
        it('Returns config if yaml Contains a network if url, ensName and chainID are specified', () => {
            writeFileSync(
                path,
                stringify({
                    messageTTL: 12345,
                    sizeLimit: 456,
                    networks: {
                        eth: {
                            url: 'foo.io',
                            ensName: '0x',
                            chainId: 123,
                        },
                    },
                }),
                { encoding: 'utf-8' },
            );
            const config = getDeliveryServiceProperties(path);

            expect(config).toStrictEqual({
                messageTTL: 12345,
                sizeLimit: 456,
                networks: {
                    eth: { url: 'foo.io', ensName: '0x', chainId: 123 },
                },
            });
        });
        it('Throws if networks does not comply to the schema', () => {
            writeFileSync(
                path,
                stringify({
                    messageTTL: 12345,
                    sizeLimit: 456,
                    networks: {
                        eth: {
                            url: 'foo.io',
                            ensName: '0x',
                            foo: 'bar',
                        },
                    },
                }),
                { encoding: 'utf-8' },
            );

            expect(() => getDeliveryServiceProperties(path)).toThrow(
                'Invalid config.yml',
            );
        });
    });

    it('Returns default DeliveryServiceProfile if config file is undefined', () => {
        const config = getDeliveryServiceProperties('/unknown-path', {
            messageTTL: 12345,
            sizeLimit: 456,
            networks: {},
        });

        expect(config).toStrictEqual({
            messageTTL: 12345,
            sizeLimit: 456,
            networks: {},
        });
    });

    it('Returns Config from path', () => {
        writeFileSync(
            path,
            stringify({
                messageTTL: 12345,
                sizeLimit: 456,
            }),
            { encoding: 'utf-8' },
        );
        const config = getDeliveryServiceProperties(path);

        expect(config).toStrictEqual({
            messageTTL: 12345,
            sizeLimit: 456,
            networks: {},
        });
    });
    //Todo think about how this
    it('Adds default properties if config.yml is not fully specified', () => {
        writeFileSync(
            path,
            stringify({
                messageTTL: 12345,
            }),
            { encoding: 'utf-8' },
        );
        const config = getDeliveryServiceProperties(path);

        expect(config).toStrictEqual({
            messageTTL: 12345,
            sizeLimit: 100000,
            networks: {},
        });
    });
});
