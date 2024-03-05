import winston from 'winston';
import { getDatabase, getDbClient } from '../getDatabase';
import { IDatabase } from '../IDatabase';
const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
import { PrismaClient } from '@prisma/client';
const { expect } = require('chai');
import { clearDb } from '../clearDb';
import { getProfileContainerByAddress } from './getProfileContainerByAddress';

describe('getUserProfileByAddress', () => {
    let prismaClient: PrismaClient;
    let db: IDatabase;

    const logger = winston.createLogger({
        transports: [new winston.transports.Console()],
    });

    beforeEach(async () => {
        prismaClient = await getDbClient(logger);
        db = await getDatabase(logger, prismaClient);
        await clearDb(prismaClient);
    });

    afterEach(async () => {
        await clearDb(prismaClient);
        prismaClient.$disconnect();
    });
    it('Retuns null if there is no profile for the address', async () => {
        const profile = await getProfileContainerByAddress(prismaClient)(
            SENDER_ADDRESS,
        );

        expect(profile).to.be.null;
    });
});
