import { getDatabase, getRedisClient, IDatabase, Redis } from '../getDatabase';
describe.skip('Delete Expired messages', () => {
    let redisClient: Redis;
    let db: IDatabase;

    beforeEach(async () => {
        redisClient = await getRedisClient();
        db = await getDatabase(redisClient);
        await redisClient.flushDb();
    });

    afterEach(async () => {
        await redisClient.flushDb();
        await redisClient.disconnect();
    });

    it('Delete all messages createdAt before a given time', async () => {
        await db.createMessage(
            'foo',
            {
                encryptedData: 'hello',
                encryptionVersion: 'x25519-chacha20-poly1305',
                to: '',
                from: '',
            },
            1,
        );
        await db.createMessage(
            'foo',
            {
                encryptedData: 'world',
                encryptionVersion: 'x25519-chacha20-poly1305',
                to: '',
                from: '',
            },
            3,
        );
        await db.createMessage(
            'foo',
            {
                encryptedData: 'dm3',
                encryptionVersion: 'x25519-chacha20-poly1305',
                to: '',
                from: '',
            },
            100,
        );

        const priorDeleteMessages = await db.getMessages('foo', 0, 50);
        expect(priorDeleteMessages.length).toBe(3);

        await db.deleteExpiredMessages(50);

        const afterDeleteMessages = await db.getMessages('foo', 0, 50);
        expect(afterDeleteMessages.length).toBe(1);

        expect(afterDeleteMessages[0].encryptedData).toBe('dm3');
    });
});
