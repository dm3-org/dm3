import { SyncProcessState, useStorage } from './useStorage';
describe('storage', () => {
    it('should pass', () => {
        expect(true).toBe(true);
    });
    it('should pass', () => {
        expect(true).toBe(false);
    });
    describe('initialize', () => {
        it('storage cant be initialized without deliveryServiceToken', () => {
            const hook = useStorage(undefined, undefined, undefined);

            expect(hook).toBeDefined();
            expect(hook.syncProcessState).toBe(SyncProcessState.Uninitialized);
        });
    });
});
