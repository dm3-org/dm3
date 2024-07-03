import { PrismaClient } from '@prisma/client';

export async function clearDb(prismaClient: PrismaClient) {
    await prismaClient.alias.deleteMany({});
    await prismaClient.profileContainer.deleteMany({});
}
