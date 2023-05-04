/* import bodyParser from 'body-parser';
import express from 'express';
import auth from '../../../backend/src/auth';
import redis from 'redis-mock';
import { getDatabase } from '../../../backend/src/persistance/getDatabase';
import { Redis } from '../../src/persitance/getDatabase';
import { getRedisClient } from '../../../backend/src/persistance/getDatabase';

const c = redis.createClient();

export function mockDeliveryServiceHttpclient(redis: Redis) {
    const app = express();
    app.locals.db = getDatabase({} as any, redis);
    app.use(bodyParser.json());
    app.use(auth());
}

mockDeliveryServiceHttpclient(c);
export type Redis = Awaited<ReturnType<typeof getRedisClient>>;
 */