import { PrismaClient } from '@prisma/client';
import { getHaltedMessages } from './getHaltedMessages';
import { getOrCreateAccount } from '../utils/getOrCreateAccount';
import { addMessageBatch } from '../addMessageBatch';
import { clearHaltedMessage } from './clearHaltedMessage';

describe('getHaltedMessages', () => {
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

    it('should get halted messages for a given account', async () => {
        const ensName = 'test';
        const messageRecord1 = {
            messageId: 'messageId1',
            createdAt: 123,
            encryptedEnvelopContainer: 'encrypted',
            isHalted: true,
        };

        const messageRecord2 = {
            messageId: 'messageId2',
            createdAt: 456,
            encryptedEnvelopContainer: 'encryptedEnvelopContainer',
            isHalted: false,
        };

        await getOrCreateAccount(prismaClient, ensName);
        await addMessageBatch(prismaClient)(ensName, 'alice.eth', [
            messageRecord1,
            messageRecord2,
        ]);

        const haltedMessages = await getHaltedMessages(prismaClient)(ensName);

        expect(haltedMessages).toHaveLength(1);
        expect(haltedMessages[0]).toEqual({
            messageId: messageRecord1.messageId,
            createdAt: new Date(123),
            isHalted: true,
            encryptedEnvelopContainer: messageRecord1.encryptedEnvelopContainer,
        });
    });
    it('should not return messages that has been cleared', async () => {
        const ensName = 'test';
        const messageRecord1 = {
            messageId: '1',
            createdAt: 123,
            encryptedEnvelopContainer: 'encrypted',
            isHalted: true,
        };

        const messageRecord2 = {
            messageId: 'messageId2',
            createdAt: 456,
            encryptedEnvelopContainer: 'encryptedEnvelopContainer',
            isHalted: false,
        };

        await getOrCreateAccount(prismaClient, ensName);
        await addMessageBatch(prismaClient)(ensName, 'alice.eth', [
            messageRecord1,
            messageRecord2,
        ]);

        const haltedMessages = await getHaltedMessages(prismaClient)(ensName);
        console.log(haltedMessages);

        expect(haltedMessages).toHaveLength(1);
        expect(haltedMessages[0]).toEqual({
            messageId: messageRecord1.messageId,
            createdAt: new Date(123),
            isHalted: true,
            encryptedEnvelopContainer: messageRecord1.encryptedEnvelopContainer,
        });

        await clearHaltedMessage(prismaClient)(
            ensName,
            ensName,
            messageRecord1.messageId,
        );

        const haltedMessagesAfterClear = await getHaltedMessages(prismaClient)(
            ensName,
        );
        expect(haltedMessagesAfterClear).toHaveLength(0);
    });
});
