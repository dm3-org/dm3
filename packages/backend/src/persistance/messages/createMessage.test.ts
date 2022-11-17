import { Redis, IDatabase, getRedisClient, getDatabase } from '../getDatabase';
import * as Lib from 'dm3-lib/dist.backend';

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const RECEIVER_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

describe('Create Message', () => {
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

    it('Creates a new Message ', async () => {
        const envelop: Lib.messaging.EncryptionEnvelop = {
            encryptedData: '',
            encryptionVersion: 'x25519-chacha20-poly1305',
            from: SENDER_ADDRESS,
            to: RECEIVER_ADDRESS,
        };

        const conversionId = SENDER_ADDRESS + RECEIVER_ADDRESS;

        const priorCreateMessages = await db.getMessages(conversionId, 0, 50);

        expect(priorCreateMessages.length).toBe(0);

        await db.createMessage(conversionId, envelop);

        const afterCreateMessages = await db.getMessages(conversionId, 0, 50);

        expect(afterCreateMessages.length).toBe(1);
    });

    it('Rejcts message with an invalid schema', async () => {
        const invalidMessage = {} as Lib.messaging.EncryptionEnvelop;
        try {
            await db.createMessage('foo', invalidMessage);
            fail();
        } catch (e) {
            expect(e).toStrictEqual(Error('Invalid message'));
        }
    });
});
