import { Redis, IDatabase, getRedisClient, getDatabase } from '../getDatabase';
import { UserProfile } from '@dm3-org/dm3-lib-profile';
import { Session } from '@dm3-org/dm3-lib-delivery';
import winston from 'winston';

const USER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';

global.logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});

describe('Set Session', () => {
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

    it('Creates a new Session ', async () => {
        const profile: UserProfile = {
            publicEncryptionKey: '',
            publicSigningKey: '',
            deliveryServices: [],
        };
        const session: Session = {
            account: USER_ADDRESS,
            signedUserProfile: { profile, signature: 'foo' },
            token: '',
            createdAt: 0,
            profileExtension: {
                notSupportedMessageTypes: [],
            },
        };

        const priorSetSession = await db.getSession(USER_ADDRESS);
        //User has no session yet
        expect(priorSetSession).toBe(null);
        await db.setSession(USER_ADDRESS, session);

        const afterSetSession = await db.getSession(USER_ADDRESS);
        //User has no session yet
        expect(afterSetSession?.signedUserProfile).toEqual({
            profile,
            signature: 'foo',
        });
    });

    it('Rejects session with an invalid schema', async () => {
        const invalidSession = {} as Session;
        try {
            await db.setSession('foo', invalidSession);
            fail();
        } catch (e) {
            expect(e).toStrictEqual(Error('Invalid session'));
        }
    });
});
