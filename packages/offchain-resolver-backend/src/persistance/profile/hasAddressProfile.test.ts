import { Redis, getRedisClient, getDatabase } from '../getDatabase';
import { IDatabase } from '../IDatabase';
import { setUserProfile } from './setUserProfile';
import { ethers } from 'ethers';
import { hasAddressProfile } from './hasAddressProfile';
import winston from 'winston';
import { UserProfile } from 'dm3-lib-profile/dist.backend';
const { expect } = require('chai');

describe('hasAddressProfile', () => {
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
    it('Returns false if the requesting address has no profile created yet', async () => {
        const { address } = ethers.Wallet.createRandom();
        const hasProfile = await hasAddressProfile(redisClient)(address);

        expect(hasProfile).to.equal(false);
    });

    it('Returns true after a profile was created', async () => {
        const name = 'foo.eth';
        const { address } = ethers.Wallet.createRandom();

        const profile: UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        await setUserProfile(redisClient)(name, profile, address);
        const hasProfile = await hasAddressProfile(redisClient)(address);

        expect(hasProfile).to.equal(true);
    });
});
