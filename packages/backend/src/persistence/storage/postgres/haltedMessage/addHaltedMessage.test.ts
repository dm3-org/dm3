import { PrismaClient } from '@prisma/client';
import { getOrCreateAccount } from '../utils/getOrCreateAccount';
import { addHaltedMessage } from './addHaltedMessage';

describe('addHaltedMessage', () => {
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
    it('should add a halted message', async () => {
        const ensName = 'test';
        const messageRecord = {
            messageId: '1',
            createdAt: 123,
            encryptedEnvelopContainer: 'encrypted',
        };

        const account = await getOrCreateAccount(prismaClient, ensName);

        await addHaltedMessage(prismaClient)(ensName, messageRecord);
        //read message from db

        const haltedMessage = await prismaClient.haltedMessage.findUnique({
            where: {
                id: messageRecord.messageId,
            },
        });

        expect(haltedMessage).toEqual({
            id: messageRecord.messageId,
            createdAt: new Date(messageRecord.createdAt),
            encryptedEnvelopContainer: messageRecord.encryptedEnvelopContainer,
            ownerId: account.id,
        });
    });
});
