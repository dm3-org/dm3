import { UserProfile } from 'dm3-lib-profile';
import { getBillboardClientApp } from '../src/getBillboardClientApp';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { getDatabase, getRedisClient } from '../src/persitance/getDatabase';
import _winston from 'winston';

chai.use(chaiHttp);

chai.should();
describe('RpcApi', () => {
    let winston;
    let redis;

    beforeEach(async () => {
        winston = _winston.createLogger();
        redis = await getRedisClient(winston);
    });
    afterEach(async () => {
        redis.quit();
    });

    describe('viewerCount', () => {
        it('returns success with viewer count', async () => {
            const profile: UserProfile = {
                publicEncryptionKey: '',
                publicSigningKey: '',
                deliveryServices: ['ds1.eth', 'ds2.eth'],
            };

            const db = await getDatabase(winston, redis);

            const res = await chai
                .request(await getBillboardClientApp(db, profile))
                .post('/rpc')
                .send({
                    jsonrpc: '2.0',
                    method: 'viewerCount',
                    params: [],
                });
        });
    });
});
