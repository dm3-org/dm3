import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import winston from 'winston';
import { Auth } from '@dm3-org/dm3-lib-shared';
import { getDeliveryServiceProperties } from './config/getDeliveryServiceProperties';
import { getDatabase } from './persistence/getDatabase';
import Profile from './profile';
import Storage from './storage';
import { logInfo } from '@dm3-org/dm3-lib-shared';
import 'dotenv/config';

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

declare global {
    var logger: winston.Logger;
}

global.logger = winston.createLogger({
    level: process.env.LOG_LEVEL ?? 'info',
    transports: [new winston.transports.Console()],
});

(async () => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: false,
            optionsSuccessStatus: 204,
        },
    });

    app.locals.io = io;

    app.locals.keys = readKeysFromEnv(process.env);
    app.locals.deliveryServiceProperties = getDeliveryServiceProperties();

    app.locals.db = await getDatabase();
    app.locals.web3Provider = getWeb3Provider(process.env);

    app.use(logRequest);

    app.get('/hello', (req, res) => {
        return res.send('Hello DM3');
    });
    app.use('/profile', Profile());
    app.use('/storage', Storage(app.locals.db));
    app.use(
        '/auth',
        Auth(app.locals.db.getSession as any, app.locals.db.setSession as any),
    );
    app.use(logError);
    app.use(errorHandler);
    //@ts-ignore
    io.use(socketAuth(app));
    //@ts-ignore
    io.on('connection', onConnection(app));
})();

// TODO include standalone web app
app.use(express.static(path.join(__dirname, '../../web/build')));
const port = process.env.PORT || '8080';

server.listen(port, () => {
    logInfo({
        text: '[Server] listening',
        port,
        dir: __dirname,
    });
});
