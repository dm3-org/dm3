export const getHaltedMessages =
    (db: PrismaClient) => async (ensName: string) => {
        //Find the account first we want to get the messages for
        const account = await db.account.findFirst({
            where: {
                id: ensName,
            },
        });

        //If the contact does not exist, return an empty array
        if (!account) {
            return [];
        }

        return await db.haltedMessage.findMany({
            where: {
                ownerId: account.id,
            },
        });
    };
