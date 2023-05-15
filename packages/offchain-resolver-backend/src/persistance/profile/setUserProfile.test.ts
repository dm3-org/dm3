import { UserProfile } from 'dm3-lib-profile/dist.backend';
import { getRedisClient, Redis, getDatabase } from '../getDatabase';
import { IDatabase } from '../IDatabase';
import { setUserProfile } from './setUserProfile';
import { ethers } from 'ethers';
import winston from 'winston';
import { SignedUserProfile } from 'dm3-lib-profile';
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
                {} as SignedUserProfile,
                address,
            ),
        ).rejectedWith(Error('Invalid user profile'));
    });
    it('Stores valid user profile', async () => {
        const { address } = ethers.Wallet.createRandom();

        const profile: SignedUserProfile = {
            signature:
                '0x0a46a1cc2a44c28f7415ba4b5a7d0af313a88ea2283f7374edecc705eece8' +
                '97009cbf930d6f7d63dc915de219f717accb4acca10cf2b38845d1bfd20649bb1fa1b',
            profile: {
                publicSigningKey:
                    '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
                publicEncryptionKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                deliveryServices: [''],
            },
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

        const profile: SignedUserProfile = {
            signature:
                '0x0a46a1cc2a44c28f7415ba4b5a7d0af313a88ea2283f7374ed' +
                'ecc705eece897009cbf930d6f7d63dc915de219f717accb4acca10cf2b38845d1bfd20649bb1fa1b',
            profile: {
                publicSigningKey:
                    '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
                publicEncryptionKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                deliveryServices: [''],
            },
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
