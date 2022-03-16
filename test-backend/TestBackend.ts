import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import * as Lib from '../src/lib';
import cors from 'cors';
import jayson from 'jayson';

const app = express();
app.use(express.json());

const server = http.createServer(app);

//TODO remove
app.use(cors());
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    },
});

const sessions = new Map<string, Lib.Delivery.Session>();
const messages = new Map<string, (Lib.EncryptionEnvelop | Lib.Envelop)[]>();
const pendingConversations = new Map<string, Set<string>>();

app.use(express.static(path.join(__dirname, '../build')));
const port = process.env.PORT || '8080';

const deliveryService = {
    requestSignInChallenge: (
        args: { accountAddress: string },
        cb: (error: any, result?: any) => void,
    ) =>
        cb(
            null,
            Lib.Delivery.requestSignInChallenge(sessions, args.accountAddress),
        ),

    submitSignedChallenge: (
        args: { challenge: string; signature: string },
        cb: (error: any, result?: any) => void,
    ) => {
        try {
            Lib.Delivery.submitSignedChallenge(
                sessions,
                args.challenge,
                args.signature,
            );
            cb(null, 'signed in');
        } catch (e) {
            cb({ code: 500, message: e });
        }
    },

    getMessages: (
        args: { accountAddress: string; contactAddress: string; token: string },
        cb: (error: any, result?: any) => void,
    ) => {
        try {
            const newMessages = Lib.Delivery.getMessages(
                sessions,
                messages,
                args.accountAddress,
                args.contactAddress,
                args.token,
            );
            cb(null, newMessages);
        } catch (e) {
            cb({ code: 500, message: e });
        }
    },

    getPendingConversations: (
        args: { accountAddress: string; token: string },
        cb: (error: any, result?: any) => void,
    ) => {
        try {
            const newPendingConversations =
                Lib.Delivery.getPendingConversations(
                    sessions,
                    pendingConversations,
                    args.accountAddress,
                    args.token,
                );
            cb(null, newPendingConversations);
        } catch (e) {
            cb({ code: 500, message: e });
        }
    },
    submitPublicKeys: (
        args: {
            accountAddress: string;
            token: string;
            publicKeys: Lib.PublicKeys;
        },
        cb: (error: any, result?: any) => void,
    ) => {
        try {
            const newPendingConversations = Lib.Delivery.submitPublicKeys(
                sessions,
                args.accountAddress,
                args.publicKeys,
                args.token,
            );
            cb(null, newPendingConversations);
        } catch (e) {
            cb({ code: 500, message: e });
        }
    },
    getPublicKeys: (
        args: { accountAddress: string; token: string; keys: Lib.PublicKeys },
        cb: (error: any, result?: any) => void,
    ) => {
        try {
            const newPendingConversations = Lib.Delivery.getPublicKeys(
                sessions,
                args.accountAddress,
            );
            cb(null, newPendingConversations);
        } catch (e) {
            cb({ code: 500, message: e });
        }
    },
};
const jaysonServer = new jayson.server(deliveryService);

app.post('/deliveryService', jaysonServer.middleware());

io.use((socket, next) => {
    const account = Lib.formatAddress(
        socket.handshake.auth.account.address as string,
    );

    if (
        !Lib.Delivery.checkToken(
            sessions,
            account,
            socket.handshake.auth.token as string,
        )
    ) {
        console.log(`[WS] Account ${account}: REJECTED`);
        return next(new Error('invalid username'));
    }
    const session = sessions.get(account) as Lib.Delivery.Session;
    session.socketId = socket.id;
    console.log(`[WS] Account ${account} with id ${socket.id}: CONNECTED`);
    //socket.username = socket.handshake.auth.account as string;
    next();
});

io.on('connection', (socket) => {
    console.log('[WS] a user connected');
    socket.on('disconnect', () => {
        console.log('[WS] user disconnected');
    });
    socket.on('disconnect', () => {
        console.log('[WS] user disconnected');
    });
    socket.on('submitMessage', (data, callback) => {
        console.log('[WS] incoming message');
        try {
            callback(
                Lib.Delivery.incomingMessage(
                    data,
                    sessions,
                    messages,
                    pendingConversations,
                    (
                        socketId: string,
                        envelop: Lib.Envelop | Lib.EncryptionEnvelop,
                    ) => socket.to(socketId).emit('message', envelop),
                ),
            );
        } catch (e) {
            console.error(e);
        }
    });
});

server.listen(port, () => {
    console.log('[Server] listening');
});
