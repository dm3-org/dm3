import winston from 'winston';

import { Message } from 'dm3-lib-messaging';
import { logger } from 'ethers';
import { getRedisClient, getDatabase, Redis, IDatabase } from '../getDatabase';

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
    it('should return the last 10 messages if neither time or idMessageCursor were provided', async () => {
        await createMockMessages(db, 15);

        const messages = await db.getMessages('billboard1.eth');

        expect(messages.length).toBe(10);
        expect(messages[0].metadata.timestamp).toBe(15);
        expect(messages[9].metadata.timestamp).toBe(6);
    });
    ``;
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
