import winston from 'winston';

import { Message } from 'dm3-lib-messaging';
import { IDatabase, Redis, getDatabase, getRedisClient } from '../getDatabase';

describe('getMessages', () => {
    let redisClient: Redis;
    let db: IDatabase;
    beforeEach(async () => {
        redisClient = await getRedisClient(winston.createLogger());
        db = await getDatabase(winston.createLogger(), redisClient);
        await redisClient.flushDb();
    });

    afterEach(async () => {
        await redisClient.flushDb();
        await redisClient.disconnect();
    });
    it('should return the latest messages if no time was provided', async () => {
        await createMockMessages(db, 15);

        const messages = await db.getMessages('billboard1.eth');

        expect(messages.length).toBe(15);
        expect(messages[0].metadata.timestamp).toBe(1);
        expect(messages[14].metadata.timestamp).toBe(15);
    });

    it('should return the 5 messages starting from the provided timestamp', async () => {
        await createMockMessages(db, 15);

        const messages = await db.getMessages('billboard1.eth', 5);

        expect(messages.length).toBe(5);
        expect(messages[0].metadata.timestamp).toBe(1);
        expect(messages[4].metadata.timestamp).toBe(5);
    });
    it('should return 2 messages starting from the provided timestamp and limit', async () => {
        await createMockMessages(db, 15);

        const messages = await db.getMessages('billboard1.eth', 5, 2);

        expect(messages.length).toBe(2);
        expect(messages[0].metadata.timestamp).toBe(4);
        expect(messages[1].metadata.timestamp).toBe(5);
    });
    it('should include messages with the same timestamp', async () => {
        await createMockMessages(db, 15);

        const msg: Message = {
            message: 'hello world 1',
            metadata: {
                to: 'alice.eth',
                from: 'bob.eth',
                timestamp: 5,
                type: 'NEW',
            },
            signature: '',
        };

        await db.createMessage('billboard1.eth', msg);
        await db.createMessage('billboard1.eth', {
            ...msg,
            message: 'hello world 2',
        });
        await db.createMessage('billboard1.eth', {
            ...msg,
            message: 'hello world 3',
        });

        const messages = await db.getMessages('billboard1.eth', 5, 5);

        expect(messages.length).toBe(5);
        expect(messages[0].metadata.timestamp).toBe(4);
        expect(messages[1].metadata.timestamp).toBe(5);
        expect(messages[2].metadata.timestamp).toBe(5);
        expect(messages[3].metadata.timestamp).toBe(5);
        expect(messages[4].metadata.timestamp).toBe(5);
    });
});

const createMockMessages = async (db: IDatabase, number: number) => {
    for (let i = 0; i < number; i++) {
        const msg: Message = {
            message: 'hello ' + (i + 1),
            metadata: {
                to: 'alice.eth',
                from: 'bob.eth',
                timestamp: i + 1,
                type: 'NEW',
            },
            signature: '',
        };
        await db.createMessage('billboard1.eth', msg);
    }
};
