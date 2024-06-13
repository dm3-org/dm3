import { createTimestamp, getTimestamp } from './Utils';

describe('Storage Utils', () => {
    describe('getTimeStamp', () => {
        it('Returns the timeStamp if the filename corresponds to the dm3 storage file naming pattern', () => {
            const file = { name: 'dm3-12345' };

            const timeStamp = getTimestamp(file);
            expect(timeStamp).toEqual(12345);
        });
        it('Returns undefinedif the file does not corresponds to the dm3 storage file naming pattern', () => {
            const file = { name: '1234323' };

            const timeStamp = getTimestamp(file);
            expect(timeStamp).toBeUndefined();
        });
        it('Returns undefinedif if the timestamp is not a number', () => {
            const file = { name: 'dm3-fooooo' };

            const timeStamp = getTimestamp(file);
            expect(timeStamp).toBeUndefined();
        });
    });
});
