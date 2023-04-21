import winston from 'winston';
import { getRedisClient, Redis, getDatabase } from '../getDatabase';
import { IDatabase } from '../IDatabase';
const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
import { getUserProfileByAddress } from './getUserProfileByAddress';
const { expect } = require('chai');

describe('getUserProfileByAddress', () => {
    let redisClient: Redis;
    let db: IDatabase;

    const logger = winston.createLogger({
        transports: [new winston.transports.Console()],
    });

    beforeEach(async () => {
        redisClient = await getRedisClient(logger);
        db = await getDatabase(logger, redisClient);
        await redisClient.flushDb();
    });

    afterEach(async () => {
        await redisClient.flushDb();
        await redisClient.disconnect();
    });
    it('Retuns null if there is no profile for the address', async () => {
        const profile = await getUserProfileByAddress(redisClient)(
            SENDER_ADDRESS,
        );

        expect(profile).to.be.null;
    });
});
