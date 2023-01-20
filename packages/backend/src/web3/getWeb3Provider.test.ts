import * as Lib from 'dm3-lib/dist.backend';
import { initializeWeb3Provider } from './getWeb3Provider';
describe('getWeb3Provider', () => {
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

            const getWeb3Provider = initializeWeb3Provider(config);

            const provider = getWeb3Provider('eth');

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

            const getWeb3Provider = initializeWeb3Provider(config);

            const provider = getWeb3Provider('foo');

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

            const getWeb3Provider = initializeWeb3Provider(config);

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

            const getWeb3Provider = initializeWeb3Provider(config);

            const provider = getWeb3Provider('eth');

            expect(provider).not.toBeNull;
            expect(provider?.network.chainId).toBe(1);
            expect(provider?.network.ensAddress).toBe('0x');
        });
        it('Throws if there is no provider at all', () => {
            const config: Lib.delivery.DeliveryServiceProperties = {
                messageTTL: 0,
                sizeLimit: 0,
                networks: {},
            };

            expect(() => initializeWeb3Provider(config)).toThrowError(
                'Please specify at least one network by providing a rpcUrl using the config.yml',
            );
        });
    });
});
