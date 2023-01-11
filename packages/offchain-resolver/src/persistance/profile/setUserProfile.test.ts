import { getRedisClient, Redis, getDatabase } from '../getDatabase';
import { IDatabase } from '../IDatabase';
import { setUserProfile } from './setUserProfile';
import * as Lib from 'dm3-lib/dist.backend';

describe('setUserProfile', () => {
    let redisClient: Redis;
    let db: IDatabase;

    beforeEach(async () => {
        redisClient = await getRedisClient();
        db = await getDatabase(redisClient);
        await redisClient.flushDb();
    });

    afterEach(async () => {
        await redisClient.flushDb();
        await redisClient.disconnect();
    });

    it('Rejects invalid user profile', async () => {
        await expect(async () => {
            await setUserProfile(redisClient)(
                'foo.eth',
                {} as Lib.account.UserProfile,
            );
        }).rejects.toEqual(Error('Invalid user profile'));
    });
    it('Stores valid user profile', async () => {
        const profile: Lib.account.UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        const writeResult = await setUserProfile(redisClient)(
            'foo.eth',
            profile,
        );

        expect(writeResult).toBeTruthy();
    });
    it('Rejects if a name already has profile attached', async () => {
        const profile: Lib.account.UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        //This should pass
        const firstWrite = await setUserProfile(redisClient)(
            'foo.eth',
            profile,
        );
        expect(firstWrite).toBeTruthy();
        //This should reject bc the subdomain already has a profile
        const secondWrite = await setUserProfile(redisClient)(
            'foo.eth',
            profile,
        );
        expect(secondWrite).toBeFalsy();
    });
});
