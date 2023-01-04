import { getRedisClient, Redis, getDatabase } from '../getDatabase';
import { IDatabase, UserProfileDto } from '../IDatabase';
import { addUserProfile } from './addUserProfile';
import * as Lib from 'dm3-lib/dist.backend';

describe('addUserProfile', () => {
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
            await addUserProfile(redisClient)('foo.eth', {} as UserProfileDto);
        }).rejects.toEqual(Error('Invalid user profile'));
    });
    it('Stores valid user profile', async () => {
        const profile: Lib.account.UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        const userProfileDto: UserProfileDto = {
            profile,
            signatures: [],
        };

        const writeResult = await addUserProfile(redisClient)(
            'foo.eth',
            userProfileDto as UserProfileDto,
        );

        expect(writeResult).toBeTruthy();
    });
    it('Rejects if a name already has profile attached', async () => {
        const profile: Lib.account.UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        const userProfileDto: UserProfileDto = {
            profile,
            signatures: [],
        };

        //This should pass
        const firstWrite = await addUserProfile(redisClient)(
            'foo.eth',
            userProfileDto as UserProfileDto,
        );
        expect(firstWrite).toBeTruthy();
        //This should reject bc the subdomain already has a profile
        const secondWrite = await addUserProfile(redisClient)(
            'foo.eth',
            userProfileDto as UserProfileDto,
        );
        expect(secondWrite).toBeFalsy();
    });
});
