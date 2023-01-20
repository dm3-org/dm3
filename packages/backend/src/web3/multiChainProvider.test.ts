import * as Lib from 'dm3-lib/dist.backend';
import { initializeMultiChainProvider } from './multiChainProvider';
describe('MultichainProvider', () => {
    describe('initializeWeb3Provider', () => {
        it('Initiaize provider from defaultNetworks', () => {
            const config: Lib.delivery.DeliveryServiceProperties = {
                messageTTL: 0,
                sizeLimit: 0,
                networks: {
                    eth: {
                        url: 'foo.io',
                    },
                },
            };

            const getWeb3Provider = initializeMultiChainProvider(config);

            const provider = getWeb3Provider('alice.eth');

            expect(provider).not.toBeNull;
            expect(provider?.network.chainId).toBe(1);
            expect(provider?.network.ensAddress).toBe(
                '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41',
            );
        });
        it('Initialize provider from config', () => {
            const config: Lib.delivery.DeliveryServiceProperties = {
                messageTTL: 0,
                sizeLimit: 0,
                networks: {
                    foo: {
                        url: 'foo.io',
                        chainId: 1234,
                        ensAddress: '0x',
                    },
                },
            };

            const getWeb3Provider = initializeMultiChainProvider(config);

            const provider = getWeb3Provider('alice.foo');

            expect(provider).not.toBeNull;
            expect(provider?.network.chainId).toBe(1234);
            expect(provider?.network.ensAddress).toBe('0x');
        });
        it('Initialize multiple networks', () => {
            const config: Lib.delivery.DeliveryServiceProperties = {
                messageTTL: 0,
                sizeLimit: 0,
                networks: {
                    foo: {
                        url: 'foo.io',
                        chainId: 1234,
                        ensAddress: '0x',
                    },
                    bnb: {
                        url: 'bnb.io',
                    },

                    eth: {
                        url: 'eth.io',
                        ensAddress: '0x',
                    },
                },
            };

            const getWeb3Provider = initializeMultiChainProvider(config);

            const fooProvider = getWeb3Provider('alice.foo');

            expect(fooProvider?.network.chainId).toBe(1234);
            expect(fooProvider?.network.ensAddress).toBe('0x');

            const bnbProvider = getWeb3Provider('alice.bnb');

            expect(bnbProvider?.network.chainId).toBe(56);
            expect(bnbProvider?.network.ensAddress).toBe(
                '0x08CEd32a7f3eeC915Ba84415e9C07a7286977956',
            );

            const ethProvider = getWeb3Provider('alice.eth');

            expect(ethProvider?.network.chainId).toBe(1);
            expect(ethProvider?.network.ensAddress).toBe('0x');
        });
        it('Config file overwrites default config', () => {
            const config: Lib.delivery.DeliveryServiceProperties = {
                messageTTL: 0,
                sizeLimit: 0,
                networks: {
                    eth: {
                        url: 'foo.io',
                        ensAddress: '0x',
                    },
                },
            };

            const getWeb3Provider = initializeMultiChainProvider(config);

            const provider = getWeb3Provider('alice.eth');

            expect(provider).not.toBeNull;
            expect(provider?.network.chainId).toBe(1);
            expect(provider?.network.ensAddress).toBe('0x');
        });
        it('Throws if custom network contains no chainId', () => {
            const config: Lib.delivery.DeliveryServiceProperties = {
                messageTTL: 0,
                sizeLimit: 0,
                networks: {
                    foo: {
                        url: 'foo.io',
                        ensAddress: '0x',
                    },
                },
            };

            expect(() => initializeMultiChainProvider(config)).toThrowError(
                'chainId is missing for network: foo',
            );
        });
        it('Throws if custom network contains no ensAddress', () => {
            const config: Lib.delivery.DeliveryServiceProperties = {
                messageTTL: 0,
                sizeLimit: 0,
                networks: {
                    foo: {
                        url: 'foo.io',
                        chainId: 1234,
                    },
                },
            };

            expect(() => initializeMultiChainProvider(config)).toThrowError(
                'ensAddress is missing for network: foo',
            );
        });
        it('Throws if there is no provider at all', () => {
            const config: Lib.delivery.DeliveryServiceProperties = {
                messageTTL: 0,
                sizeLimit: 0,
                networks: {},
            };

            expect(() => initializeMultiChainProvider(config)).toThrowError(
                'Please specify at least one network by providing a rpcUrl using the config.yml',
            );
        });
    });
    describe('resolveName', () => {
        it('throws if name is invalid', () => {
            const config: Lib.delivery.DeliveryServiceProperties = {
                messageTTL: 0,
                sizeLimit: 0,
                networks: {
                    eth: {
                        url: 'foo.io',
                    },
                },
            };

            const getWeb3Provider = initializeMultiChainProvider(config);

            expect(() => getWeb3Provider('rfrfrwerferkmklvmnt')).toThrowError(
                'Invalid ENS name',
            );
        });
        it('throws if network is not supported', () => {
            const config: Lib.delivery.DeliveryServiceProperties = {
                messageTTL: 0,
                sizeLimit: 0,
                networks: {
                    eth: {
                        url: 'foo.io',
                    },
                },
            };

            const getWeb3Provider = initializeMultiChainProvider(config);

            expect(getWeb3Provider('alice.bnb')).toBeNull;
        });
        it('resolve subdomains properly', () => {
            const config: Lib.delivery.DeliveryServiceProperties = {
                messageTTL: 0,
                sizeLimit: 0,
                networks: {
                    eth: {
                        url: 'foo.io',
                    },
                },
            };

            const ensName =
                '0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870.dev-dm3.eth';

            const getWeb3Provider = initializeMultiChainProvider(config);

            const provider = getWeb3Provider(ensName);

            expect(provider?.network.chainId).toBe(1);
        });
    });
});
