/* eslint-disable no-console */
describe('storage', () => {
    let windowSpy: any;

    beforeEach(() => {
        windowSpy = jest.spyOn(window, 'window', 'get');
    });

    afterEach(() => {
        windowSpy.mockRestore();
    });

    describe('initialize', () => {
        it('storage cant be initialized without deliveryServiceToken', () => {
            Object.defineProperty(global, 'window', {
                //@ts-ignore
                sodium: {
                    onload: function (sodium: any) {
                        let h = sodium.crypto_generichash(
                            64,
                            sodium.from_string('test'),
                        );
                        console.log(sodium.to_hex(h));
                    },
                },
            });

            const useStorage = require('./useStorage').useStorage;
            console.log('check');
            const { SyncProcessState } = require('../../utils/enum-type-utils');
            const hook = useStorage(undefined, undefined, undefined);

            expect(hook).toBeDefined();
            expect(hook.syncProcessState).toBe(SyncProcessState.Uninitialized);
        });
    });
});
