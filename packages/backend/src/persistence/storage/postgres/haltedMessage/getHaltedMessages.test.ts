import { PrismaClient } from '@prisma/client';
import { getHaltedMessages } from './getHaltedMessages';
import { getOrCreateAccount } from '../utils/getOrCreateAccount';
import { addHaltedMessage } from './addHaltedMessage';

describe('getHaltedMessages', () => {
    let prismaClient: PrismaClient;

    beforeEach(async () => {
        prismaClient = new PrismaClient();
    });

    afterEach(async () => {
        await prismaClient.haltedMessage.deleteMany({});
        await prismaClient.account.deleteMany({});
        prismaClient.$disconnect();
    });

    it('should get halted messages for a given account', async () => {
        const ensName = 'test';
        const messageRecord = {
            messageId: '1',
            createdAt: 123,
            encryptedEnvelopContainer: 'encrypted',
        };

        await getOrCreateAccount(prismaClient, ensName);
        await addHaltedMessage(prismaClient)(ensName, messageRecord);

        const haltedMessages = await getHaltedMessages(prismaClient)(ensName);

        expect(haltedMessages).toHaveLength(1);
        expect(haltedMessages[0]).toEqual({
            id: messageRecord.messageId,
            createdAt: new Date(messageRecord.createdAt),
            encryptedEnvelopContainer: messageRecord.encryptedEnvelopContainer,
            ownerId: ensName,
        });
    });
});
