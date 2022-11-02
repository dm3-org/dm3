import express, { NextFunction, Response, Request } from 'express';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import * as Lib from 'dm3-lib/dist.backend';
import cors from 'cors';
import { createRedisClient, getSession, setSession } from './redis';
import Profile from './profile';
import Auth from './auth';
import Storage from './storage';
import Delivery from './delivery';
import RpcProxy from './rpc-proxy';
import { errorHandler, logError, logRequest, socketAuth } from './utils';
import { onConnection } from './messaging';
import winston from 'winston';
import { DeliveryServiceProfile } from 'dm3-lib/dist.backend/delivery/Delivery';
import { Axios } from 'axios';
import bodyParser from 'body-parser';

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

    app.use(logRequest);
    app.use('/profile', Profile);
    app.use('/storage', Storage);
    app.use('/auth', Auth);
    app.use('/delivery', Delivery);
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
