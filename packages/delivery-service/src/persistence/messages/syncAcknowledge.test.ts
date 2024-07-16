import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import winston from 'winston';
import { IDatabase, Redis, getDatabase, getRedisClient } from '../getDatabase';

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const RECEIVER_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

global.logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});

describe('Sync Acknowledge', () => {
    let redisClient: Redis;
    let db: IDatabase;
    const logger = winston.createLogger({
        transports: [new winston.transports.Console()],
    });

    beforeEach(async () => {
        redisClient = await getRedisClient();
        db = await getDatabase(redisClient);
        await redisClient.flushDb();
    });

    afterEach(async () => {
        await redisClient.flushDb();
        await redisClient.disconnect();
    });

    it('Removes acknowledged messages from DS', async () => {
        const envelop: EncryptionEnvelop = {
            message: '',
            metadata: {
                deliveryInformation: {
                    to: RECEIVER_ADDRESS,
                    from: SENDER_ADDRESS,
                },
                signature: '',
                encryptedMessageHash: '',
                version: '',
                encryptionScheme: 'x25519-chacha20-poly1305',
            },
        };

        const conversionId = SENDER_ADDRESS + RECEIVER_ADDRESS;

        const priorCreateMessages = await db.getIncomingMessages(
            RECEIVER_ADDRESS,
            10,
        );

        expect(priorCreateMessages.length).toBe(0);

        await db.createMessage(conversionId, envelop, 200);

        const afterCreateMessages = await db.getIncomingMessages(
            RECEIVER_ADDRESS,
            10,
        );

        expect(afterCreateMessages.length).toBe(1);

        await db.syncAcknowledge(conversionId, 300);

        const afterSyncAcknowledge = await db.getIncomingMessages(
            RECEIVER_ADDRESS,
            10,
        );

        expect(afterSyncAcknowledge.length).toBe(0);
    });
    it('Keeps messages on the DS that have been created after the sync ', async () => {
        const envelop1: EncryptionEnvelop = {
            message: '',
            metadata: {
                deliveryInformation: {
                    to: RECEIVER_ADDRESS,
                    from: SENDER_ADDRESS,
                },
                signature: '',
                encryptedMessageHash: '',
                version: '',
                encryptionScheme: 'x25519-chacha20-poly1305',
            },
        };
        const envelop2: EncryptionEnvelop = {
            message: 'foo',
            metadata: {
                deliveryInformation: {
                    to: RECEIVER_ADDRESS,
                    from: SENDER_ADDRESS,
                },
                signature: '',
                encryptedMessageHash: '',
                version: '',
                encryptionScheme: 'x25519-chacha20-poly1305',
            },
        };
        const envelop3: EncryptionEnvelop = {
            message: 'bar',
            metadata: {
                deliveryInformation: {
                    to: RECEIVER_ADDRESS,
                    from: SENDER_ADDRESS,
                },
                signature: '',
                encryptedMessageHash: '',
                version: '',
                encryptionScheme: 'x25519-chacha20-poly1305',
            },
        };

        const conversionId = SENDER_ADDRESS + RECEIVER_ADDRESS;

        const priorCreateMessages = await db.getIncomingMessages(
            RECEIVER_ADDRESS,
            10,
        );

        expect(priorCreateMessages.length).toBe(0);

        await db.createMessage(conversionId, envelop1, 200);
        await db.createMessage(conversionId, envelop2, 301);
        await db.createMessage(conversionId, envelop3, 302);

        const afterCreateMessages = await db.getIncomingMessages(
            RECEIVER_ADDRESS,
            10,
        );

        expect(afterCreateMessages.length).toBe(3);

        await db.syncAcknowledge(conversionId, 300);

        let afterSyncAcknowledge = await db.getIncomingMessages(
            RECEIVER_ADDRESS,
            10,
        );

        expect(afterSyncAcknowledge.length).toBe(2);

        await db.syncAcknowledge(conversionId, 303);

        afterSyncAcknowledge = await db.getIncomingMessages(
            RECEIVER_ADDRESS,
            10,
        );
        expect(afterSyncAcknowledge.length).toBe(0);
    });
});
