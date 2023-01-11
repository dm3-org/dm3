import { USER_PROFILE_KEY } from '.';
import { IDatabase } from '../IDatabase';
import { getDatabase, getRedisClient, Redis } from './../getDatabase';
import { getUserProfile } from './getUserProfile';
import * as Lib from 'dm3-lib/dist.backend';

describe('getUserProfile', () => {
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

    it('Returns null if the name has no profile yet', async () => {
        const profile = await getUserProfile(redisClient)('foo');

        expect(profile).toBeNull();
    });

    it('Returns the profile if a name has one', async () => {
        const name = 'foo.eth';

        const profile: Lib.account.UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        await redisClient.hSet(USER_PROFILE_KEY, name, JSON.stringify(profile));

        const retrivedProfile = await getUserProfile(redisClient)(name);

        expect(retrivedProfile).toStrictEqual(profile);
    });
});
