import { setUserProfile } from '.';
import { IDatabase } from '../IDatabase';
import { getDatabase, getRedisClient, Redis } from './../getDatabase';
import { getUserProfile } from './getUserProfile';
import * as Lib from 'dm3-lib/dist.backend';
import { ethers } from 'ethers';
import winston from 'winston';
const { expect } = require('chai');

describe('getUserProfile', () => {
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

    it('Returns null if the name has no profile yet', async () => {
        const profile = await getUserProfile(redisClient)('foo');
        expect(profile).to.be.null;
    });

    it('Returns the profile if a name has one', async () => {
        const name = 'foo.eth';
        const { address } = ethers.Wallet.createRandom();

        const profile: Lib.account.UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        await setUserProfile(redisClient)(name, profile, address);
        const retrivedProfile = await getUserProfile(redisClient)(name);

        expect(retrivedProfile).to.eql(profile);
    });
});
