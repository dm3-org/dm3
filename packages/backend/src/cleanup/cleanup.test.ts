import { IDatabase } from '../persistance/getDatabase';
import { startCleanupJob } from './cleanup';

describe('Cleanup test', () => {
    let timer: NodeJS.Timer;
    afterEach(() => {
        clearInterval(timer);
    });
    it('Cleans up messages within a givin interval', async () => {
        const deletedExpiredMessagesMock = jest.fn();
        const db = {
            deleteExpiredMessages: deletedExpiredMessagesMock,
        } as unknown as IDatabase;

        timer = startCleanupJob(db, 1, 1000)!;

        expect(timer).toBeTruthy();

        await wait(3);

        expect(deletedExpiredMessagesMock).toBeCalled();
    }, 5000);
    it('Dont start start job if ttl is 0 ', async () => {
        const deletedExpiredMessagesMock = jest.fn();
        const db = {
            deleteExpiredMessages: deletedExpiredMessagesMock,
        } as unknown as IDatabase;

        const timer = startCleanupJob(db, 0, 1000);

        expect(timer).toBeFalsy();
    }, 5000);
    it('Dont start start job if ttl is below 0 ', async () => {
        const deletedExpiredMessagesMock = jest.fn();
        const db = {
            deleteExpiredMessages: deletedExpiredMessagesMock,
        } as unknown as IDatabase;

        const timer = startCleanupJob(db, -1, 1000);

        expect(timer).toBeFalsy();
    }, 5000);
});

const wait = async (seconds: number) => {
    return await new Promise((res: any, _: any) => {
        setTimeout(() => {
            res();
        }, seconds * 1000);
    });
};
