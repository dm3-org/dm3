import { Session } from '@dm3-org/dm3-lib-delivery';
import {
    Auth,
    Profile,
    errorHandler,
    getCachedWebProvider,
    getServerSecret,
    logError,
    logRequest,
    readKeysFromEnv,
    socketAuth,
} from '@dm3-org/dm3-lib-server-side';
import { NotificationChannelType, logInfo } from '@dm3-org/dm3-lib-shared';
import { Axios } from 'axios';
import bodyParser from 'body-parser';
import cors from 'cors';
import 'dotenv/config';
import { ethers } from 'ethers';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import webpush from 'web-push';
import winston from 'winston';
import { startCleanUpPendingMessagesJob } from './cleanup/cleanUpPendingMessages';
import { getDeliveryServiceProperties } from './config/getDeliveryServiceProperties';
import Delivery from './delivery';
import { onConnection } from './messaging';
import Notifications from './notifications';
import { IDatabase, getDatabase } from './persistence/getDatabase';
import RpcProxy from './rpc/rpc-proxy';
import { WebSocketManager } from './ws/WebSocketManager';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

const server = http.createServer(app);

const getDbWithAddressResolvedGetAccount = (
    db: IDatabase,
    web3Provider: ethers.providers.JsonRpcProvider,
): IDatabase => {
    const getAccountForEnsName = (
        web3Provider: ethers.providers.JsonRpcProvider,
        getAccount: (ensName: string) => Promise<Session | null>,
    ) => {
        return async (ensName: string) => {
            const address = await web3Provider.resolveName(ensName);
            console.debug(
                'getDbWithAddressResolvedGetAccount resolved address for ens name: ',
                ensName,
                address,
            );
            if (!address) {
                console.info('no address found for ens name: ', ensName);
                return null;
            }
            return getAccount(address);
        };
    };

    return {
        ...db,
        getAccount: getAccountForEnsName(web3Provider, db.getAccount),
    };
};
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
    // load environment
    const deliveryServiceProperties = getDeliveryServiceProperties();
    const web3Provider = await getCachedWebProvider(process.env);

    const db = getDbWithAddressResolvedGetAccount(
        await getDatabase(),
        web3Provider,
    );
    const keys = readKeysFromEnv(process.env);
    const serverSecret = getServerSecret(process.env);

    // set the push notification configuration
    const pushNotificationConfig =
        deliveryServiceProperties.notificationChannel.filter(
            (data) => data.type === NotificationChannelType.PUSH,
        );

    if (pushNotificationConfig.length) {
        webpush.setVapidDetails(
            `mailto:${pushNotificationConfig[0].config.vapidEmailId}`,
            pushNotificationConfig[0].config.publicVapidKey,
            pushNotificationConfig[0].config.privateVapidKey,
        );
    }

    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: false,
            optionsSuccessStatus: 204,
        },
    });

    const webSocketManager = new WebSocketManager(
        io,
        web3Provider,
        db,
        serverSecret,
    );

    app.use(logRequest);

    app.get('/hello', (req, res) => {
        return res.send('Hello DM3');
    });

    //Auth
    //socketAuth
    //restAuth

    app.use('/auth', Auth(db, serverSecret));
    app.use('/profile', Profile(db, web3Provider, serverSecret));
    app.use('/delivery', Delivery(web3Provider, db, serverSecret));
    app.use(
        '/notifications',
        Notifications(
            deliveryServiceProperties,
            db,
            web3Provider,
            serverSecret,
        ),
    );
    app.use(logError);
    app.use(errorHandler);
    io.use(socketAuth(db, web3Provider, serverSecret));
    io.on(
        'connection',
        onConnection(
            io,
            web3Provider,
            db,
            keys,
            serverSecret,
            webSocketManager,
        ),
    );
    startCleanUpPendingMessagesJob(db, deliveryServiceProperties.messageTTL);
    app.use(
        '/rpc',
        RpcProxy(
            new Axios({ url: process.env.RPC }),
            deliveryServiceProperties,
            io,
            web3Provider,
            db,
            keys,
            webSocketManager,
        ),
    );
})();

const port = process.env.PORT || '8080';

server.listen(port, () => {
    logInfo({
        text: '[Server] listening',
        port,
        dir: __dirname,
    });
});
