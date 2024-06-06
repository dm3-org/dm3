import {
    Auth,
    errorHandler,
    getCachedWebProvider,
    getServerSecret,
    logError,
    logRequest,
    socketAuth,
} from '@dm3-org/dm3-lib-server-side';
import { logInfo } from '@dm3-org/dm3-lib-shared';
import bodyParser from 'body-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import winston from 'winston';
import { getDatabase } from './persistence/getDatabase';
import Profile from './profile';
import Storage from './storage';

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

winston.loggers.add('default', global.logger);

(async () => {
    //TODO REPLACE WITH WS MANAGER
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: false,
            optionsSuccessStatus: 204,
        },
    });

    const db = await getDatabase();
    const web3Provider = await getCachedWebProvider(process.env);
    const serverSecret = getServerSecret(process.env);

    app.use(logRequest);

    app.get('/hello', (req, res) => {
        return res.send('Hello DM3');
    });
    app.use('/profile', Profile(db, io, web3Provider, serverSecret));
    app.use('/storage', Storage(db, web3Provider, serverSecret));
    app.use('/auth', Auth(db.getSession as any, serverSecret));
    app.use(logError);
    app.use(errorHandler);
    io.use(socketAuth(db, web3Provider, serverSecret));
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
