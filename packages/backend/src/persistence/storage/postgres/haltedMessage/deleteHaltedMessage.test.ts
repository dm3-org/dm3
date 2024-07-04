import { PrismaClient } from '@prisma/client';
import { deleteHaltedMessage } from './deleteHaltedMessage';
import { getOrCreateAccount } from '../utils/getOrCreateAccount';

// Mock the PrismaClient
const mockDb = new PrismaClient();

describe('deleteHaltedMessage', () => {
    let prismaClient: PrismaClient;

    beforeEach(async () => {
        prismaClient = new PrismaClient();
    });

    afterEach(async () => {
        await prismaClient.haltedMessage.deleteMany({});
        await prismaClient.encryptedMessage.deleteMany({});
        await prismaClient.conversation.deleteMany({});
        await prismaClient.account.deleteMany({});

        prismaClient.$disconnect();
    });
    it('should return false if account does not exist', async () => {
        const result = await deleteHaltedMessage(mockDb)(
            'bob.eth',
            'messageId',
        );
        expect(result).toBe(false);
    });

    it('should return true if message is successfully deleted', async () => {
        const account = await getOrCreateAccount(prismaClient, 'bob.eth');
        //create message first
        await mockDb.haltedMessage.create({
            data: {
                id: 'messageId',
                createdAt: new Date(1234),
                encryptedEnvelopContainer: 'encryptedEnvelopContainer',
                ownerId: account.id,
            },
        });
        const result = await deleteHaltedMessage(mockDb)(
            'bob.eth',
            'messageId',
        );
        expect(result).toBe(true);
    });

    it('should return false if deletion fails', async () => {
        const result = await deleteHaltedMessage(mockDb)(
            'existing',
            'messageId',
        );
        expect(result).toBe(false);
    });
});
