import express from 'express';
import { Server, Socket } from 'socket.io';
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

let messages = new Map<string, Lib.EncryptionEnvelop[]>();
// Maps not registered accounts to accounts who send messages to the unregistered account
let pendingConversations = new Map<string, Set<string>>();

// Maps accounts to the last uri pointing to the last public message from this account
let messageHeads = new Map<string, string>();

let publicMessages = new Map<string, Lib.PublicEnvelop>();

app.use(express.static(path.join(__dirname, '../build')));
const port = process.env.PORT || '8080';

const deliveryService = {
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
            const response = Lib.Delivery.getPendingConversations(
                sessions,
                pendingConversations,
                args.accountAddress,
                args.token,
            );
            pendingConversations = response.pendingConversations;
            cb(null, {
                pendingConversations: response.pendingConversationsForAccount,
            });
        } catch (e) {
            cb({ code: 500, message: e });
        }
    },
    submitProfileRegistryEntry: (
        args: {
            accountAddress: string;
            signedProfileRegistryEntry: Lib.SignedProfileRegistryEntry;
        },
        cb: (error: any, result?: any) => void,
    ) => {
        try {
            const token = Lib.Delivery.submitProfileRegistryEntry(
                sessions,
                args.accountAddress,
                args.signedProfileRegistryEntry,
                pendingConversations,
                (socketId: string) => io.sockets.to(socketId).emit('joined'),
            );
            cb(null, token);
        } catch (e) {
            cb({ code: 500, message: e });
        }
    },
    getProfileRegistryEntry: (
        args: { accountAddress: string; token: string; keys: Lib.PublicKeys },
        cb: (error: any, result?: any) => void,
    ) => {
        try {
            const publicKeys = Lib.Delivery.getProfileRegistryEntry(
                sessions,
                args.accountAddress,
            );
            cb(null, publicKeys);
        } catch (e) {
            cb({ code: 500, message: e });
        }
    },

    syncAcknoledgment: (
        args: {
            accountAddress: string;
            token: string;
            acknoledgments: Lib.Delivery.Acknoledgment[];
        },
        cb: (error: any, result?: any) => void,
    ) => {
        try {
            messages = Lib.Delivery.handleSyncAcknoledgment(
                args.accountAddress,
                args.acknoledgments,
                args.token,
                sessions,
                messages,
            );
            cb(null, 'success');
        } catch (e) {
            cb({ code: 500, message: e });
        }
    },
};

const jaysonServer = new jayson.server(deliveryService);
app.post('/deliveryService', jaysonServer.middleware());

app.get('/profile/:address', (req, res) => {
    res.json(
        Lib.Delivery.getProfileRegistryEntry(sessions, req.params.address),
    );
});

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
        Lib.log(`[WS] Account ${account}: REJECTED`);
        return next(new Error('invalid username'));
    }
    const session = sessions.get(account) as Lib.Delivery.Session;
    session.socketId = socket.id;
    Lib.log(`[WS] Account ${account} with id ${socket.id}: CONNECTED`);
    //socket.username = socket.handshake.auth.account as string;
    next();
});

io.on('connection', (socket) => {
    Lib.log('[WS] a user connected');
    socket.on('disconnect', () => {
        Lib.log('[WS] user disconnected');
    });
    socket.on('disconnect', () => {
        Lib.log('[WS] user disconnected');
    });
    socket.on('submitMessage', (data, callback) => {
        try {
            (messages = Lib.Delivery.incomingMessage(
                data,
                sessions,
                messages,
                (socketId: string, envelop: Lib.EncryptionEnvelop) => {
                    io.sockets.to(socketId).emit('message', envelop);
                },
            )),
                callback('success');
        } catch (e) {
            console.error(e);
        }
    });
    socket.on('submitPublicMessage', (data, callback) => {
        try {
            ({ messageHeads, publicMessages } =
                Lib.Delivery.incomingPublicMessage(
                    data,
                    sessions,
                    messageHeads,
                    publicMessages,
                )),
                callback('success');
        } catch (e) {
            console.error(e);
        }
    });
    socket.on('pendingMessage', (data) => {
        try {
            pendingConversations = Lib.Delivery.createPendingEntry(
                data.accountAddress,
                data.contactAddress,
                data.token,
                sessions,
                pendingConversations,
            );
        } catch (e) {
            console.error(e);
        }
    });
});

server.listen(port, () => {
    Lib.log('[Server] listening');
});
