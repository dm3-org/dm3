import { PrismaClient } from '@prisma/client';
import { clearHaltedMessage } from './clearHaltedMessage';
import { getOrCreateAccount } from '../utils/getOrCreateAccount';
import { addMessageBatch } from '../addMessageBatch';

// Mock the PrismaClient
const mockDb = new PrismaClient();

describe('deleteHaltedMessage', () => {
    let prismaClient: PrismaClient;

    beforeEach(async () => {
        prismaClient = new PrismaClient();
    });

    afterEach(async () => {
        await prismaClient.encryptedMessage.deleteMany({});
        await prismaClient.conversation.deleteMany({});
        await prismaClient.account.deleteMany({});

        prismaClient.$disconnect();
    });
    it('should return false if account does not exist', async () => {
        const result = await clearHaltedMessage(mockDb)('bob.eth', 'messageId');
        expect(result).toBe(false);
    });

    it('should return false if message does not exist', async () => {
        const result = await clearHaltedMessage(mockDb)(
            'existing',
            'messageId',
        );
        expect(result).toBe(false);
    });

    it('should return true if message is successfully deleted', async () => {
        const account = await getOrCreateAccount(prismaClient, 'bob.eth');
        //create message first
        const messageRecord1 = {
            messageId: 'messageId1',
            createdAt: 123,
            encryptedEnvelopContainer: 'encryptedEnvelopContainer',
            isHalted: true,
        };
        const messageRecord2 = {
            messageId: 'messageId2',
            createdAt: 456,
            encryptedEnvelopContainer: 'encryptedEnvelopContainer',
            isHalted: false,
        };

        await addMessageBatch(prismaClient)('bob.eth', 'alice.eth', [
            messageRecord1,
            messageRecord2,
        ]);

        const result = await clearHaltedMessage(mockDb)(
            'bob.eth',
            'messageId1',
        );
        expect(result).toBe(true);
    });
});
