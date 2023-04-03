import { getRedisClient, Redis, getDatabase } from '../getDatabase';
import { IDatabase } from '../IDatabase';
import { setUserProfile } from './setUserProfile';
import * as Lib from 'dm3-lib/dist.backend';
import { ethers } from 'ethers';
import winston from 'winston';
const { expect } = require('chai');

describe('setUserProfile', () => {
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

    it('Rejects invalid user profile', async () => {
        const { address } = ethers.Wallet.createRandom();

        expect(
            setUserProfile(redisClient)(
                'foo.eth',
                {} as Lib.profile.UserProfile,
                address,
            ),
        ).rejectedWith(Error('Invalid user profile'));
    });
    it('Stores valid user profile', async () => {
        const { address } = ethers.Wallet.createRandom();

        const profile: Lib.profile.UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        const writeResult = await setUserProfile(redisClient)(
            'foo.eth',
            profile,
            address,
        );

        expect(writeResult).to.be.true;
    });
    it('Rejects if a name already has profile attached', async () => {
        const { address } = ethers.Wallet.createRandom();

        const profile: Lib.profile.UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        //This should pass
        const firstWrite = await setUserProfile(redisClient)(
            'foo.eth',
            profile,
            address,
        );
        expect(firstWrite).to.be.true;
        //This should reject bc the subdomain already has a profile
        const secondWrite = await setUserProfile(redisClient)(
            'foo.eth',
            profile,
            address,
        );
        expect(secondWrite).to.be.false;
    });
});
