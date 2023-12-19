import { getSize } from './utils';
import { makeEnvelop } from './testHelper';

describe('utils', () => {
    describe('getSize', () => {
        it('should return the size of the stringified envelop', () => {
            const envelop = makeEnvelop('from', 'to', 'message', Date.now());
            const size = getSize(envelop);
            const stringifiedEnvelop = JSON.stringify(envelop);
            const expectedSize = new Blob([stringifiedEnvelop]).size;
            expect(size).toEqual(expectedSize);
        });
    });
});
