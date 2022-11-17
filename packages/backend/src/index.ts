import { Axios } from 'axios';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as Lib from 'dm3-lib/dist.backend';
import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import winston from 'winston';
import Auth from './auth';
import { getDeliveryServiceProperties } from './config/getDeliveryServiceProperties';
import Delivery from './delivery';
import { onConnection } from './messaging';
import { getDatabase } from './persistance/getDatabase';
import Profile from './profile';
import { createRedisClient, getSession, setSession } from './redis';
import RpcProxy from './rpc/rpc-proxy';
import Storage from './storage';
import { errorHandler, logError, logRequest, socketAuth } from './utils';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

const server = http.createServer(app);

//TODO remove
app.use(cors());
app.use(bodyParser.json());
let redisClient: undefined | Awaited<ReturnType<typeof createRedisClient>>;

(async () => {
    app.locals.logger = winston.createLogger({
        transports: [new winston.transports.Console()],
    });

    redisClient = await createRedisClient(app);
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: false,
            optionsSuccessStatus: 204,
        },
    });

    app.locals.redisClient = redisClient;
    app.locals.loadSession = async (accountAddress: string) => {
        return redisClient ? getSession(accountAddress, redisClient) : null;
    };
    app.locals.storeSession = async (
        accountAddress: string,
        session: Lib.delivery.Session,
    ) => {
        return redisClient
            ? setSession(accountAddress, session, redisClient)
            : null;
    };
    app.locals.io = io;

    app.locals.deliveryServicePrivateKey = process.env.PRIVATE_KEY;

    app.locals.deliveryServiceProperties = getDeliveryServiceProperties();

    app.locals.db = await getDatabase();

    app.use(logRequest);
    app.use('/profile', Profile());
    app.use('/storage', Storage());
    app.use('/auth', Auth());
    app.use('/delivery', Delivery());
    app.use('/rpc', RpcProxy(new Axios({ url: process.env.RPC })));
    app.use(logError);
    app.use(errorHandler);

    io.use(socketAuth(app));

    io.on('connection', onConnection(app));
})();

// TODO include standalone web app
app.use(express.static(path.join(__dirname, '../../web/build')));
const port = process.env.PORT || '8080';

server.listen(port, () => {
    Lib.log('[Server] listening');
});
