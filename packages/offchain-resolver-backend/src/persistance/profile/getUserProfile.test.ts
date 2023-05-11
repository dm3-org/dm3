import {
    getProfileCreationMessage,
    SignedUserProfile,
    UserProfile,
} from 'dm3-lib-profile';
import { ethers } from 'ethers';
import winston from 'winston';
import { setUserProfile } from '.';
import { IDatabase } from '../IDatabase';
import { getDatabase, getRedisClient, Redis } from './../getDatabase';
import { getUserProfile } from './getUserProfile';
import { stringify } from 'dm3-lib-shared';
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

        const profile: SignedUserProfile = {
            signature:
                '0x0a46a1cc2a44c28f7415ba4b5a7d0af313a88ea2283f7374edecc' +
                '705eece897009cbf930d6f7d63dc915de219f717accb4acca10cf2b38845d1bfd20649bb1fa1b',
            profile: {
                publicSigningKey:
                    '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
                publicEncryptionKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                deliveryServices: [''],
            },
        };

        await setUserProfile(redisClient)(name, profile, address);
        const retrivedProfile = await getUserProfile(redisClient)(name);

        expect(retrivedProfile).to.eql(profile);
    });
});
