import { getRedisClient, Redis, getDatabase } from '../getDatabase';
import { IDatabase } from '../IDatabase';
import { setUserProfile } from './setUserProfile';
import * as Lib from 'dm3-lib/dist.backend';
import { ethers } from 'ethers';
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
        const { address } = ethers.Wallet.createRandom();

        await expect(async () => {
            await setUserProfile(redisClient)(
                'foo.eth',
                {} as Lib.account.UserProfile,
                address,
            );
        }).rejects.toEqual(Error('Invalid user profile'));
    });
    it('Stores valid user profile', async () => {
        const { address } = ethers.Wallet.createRandom();

        const profile: Lib.account.UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        const writeResult = await setUserProfile(redisClient)(
            'foo.eth',
            profile,
            address,
        );

        expect(writeResult).toBeTruthy();
    });
    it('Rejects if a name already has profile attached', async () => {
        const { address } = ethers.Wallet.createRandom();

        const profile: Lib.account.UserProfile = {
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
        expect(firstWrite).toBeTruthy();
        //This should reject bc the subdomain already has a profile
        const secondWrite = await setUserProfile(redisClient)(
            'foo.eth',
            profile,
            address,
        );
        expect(secondWrite).toBeFalsy();
    });
});
