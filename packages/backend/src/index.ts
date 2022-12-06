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
import { startCleanUpPendingMessagesJob } from './cleanup/cleanUpPendingMessages';
import { getDeliveryServiceProperties } from './config/getDeliveryServiceProperties';
import Delivery from './delivery';
import { onConnection } from './messaging';
import { getDatabase } from './persistance/getDatabase';
import Profile from './profile';
import { createRedisClient } from './redis';
import RpcProxy from './rpc/rpc-proxy';
import Storage from './storage';
import {
    errorHandler,
    getWeb3Provider,
    logError,
    logRequest,
    readKeysFromEnv,
    socketAuth,
} from './utils';

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
    app.locals.io = io;

    app.locals.keys = readKeysFromEnv(process.env);

    app.locals.deliveryServiceProperties = getDeliveryServiceProperties();

    app.locals.db = await getDatabase();
    app.locals.web3Provider = getWeb3Provider(process.env);

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

    startCleanUpPendingMessagesJob(
        app.locals.db,
        app.locals.deliveryServiceProperties.messageTTL,
    );
})();

// TODO include standalone web app
app.use(express.static(path.join(__dirname, '../../web/build')));
const port = process.env.PORT || '8080';

server.listen(port, () => {
    Lib.log('[Server] listening');
});
