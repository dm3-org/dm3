import { PrismaClient } from '@prisma/client';

export async function clearDb(prismaClient: PrismaClient) {
    await prismaClient.profileContainer.deleteMany({});
}
