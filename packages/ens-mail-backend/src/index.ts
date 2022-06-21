import express from 'express';
import { Server, Socket } from 'socket.io';
import http from 'http';
import path from 'path';
import * as Lib from 'ens-mail-lib';
import cors from 'cors';
import jayson from 'jayson';
import {
    RedisPrefix,
    createRedisClient,
    getSession,
    setSession,
} from './redis';

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

// Maps not registered accounts to accounts who send messages to the unregistered account
let pendingConversations = new Map<string, Set<string>>();

let redisClient: undefined | Awaited<ReturnType<typeof createRedisClient>>;

(async () => {
    redisClient = await createRedisClient();
})();

// TODO include standalone web app
app.use(express.static(path.join(__dirname, '../build')));
const port = process.env.PORT || '8080';

const loadSession = async (accountAddress: string) => {
    return redisClient ? getSession(accountAddress, redisClient) : null;
};

const storeSession = async (
    accountAddress: string,
    session: Lib.Delivery.Session,
) => {
    if (!redisClient) {
        throw Error('redis client not connected');
    }
    return setSession(accountAddress, session, redisClient);
};

const deliveryService = {
    getMessages: async (
        args: { accountAddress: string; contactAddress: string; token: string },
        cb: (error: any, result?: any) => void,
    ) => {
        try {
            const newMessages = await Lib.Delivery.getMessages(
                loadSession,
                async (
                    conversationId: string,
                    offset: number,
                    size: number,
                ) => {
                    if (redisClient) {
                        return (
                            (await redisClient.exists(
                                RedisPrefix.Conversation + conversationId,
                            ))
                                ? await redisClient.zRange(
                                      RedisPrefix.Conversation + conversationId,
                                      offset,
                                      offset + size,
                                      { REV: true },
                                  )
                                : []
                        ).map((envelopString) => JSON.parse(envelopString));
                    } else {
                        throw Error('db not connected');
                    }
                },

                args.accountAddress,
                args.contactAddress,
                args.token,
            );
            cb(null, newMessages);
        } catch (e) {
            cb({ code: 500, message: e });
        }
    },

    getPendingConversations: async (
        args: { accountAddress: string; token: string },
        cb: (error: any, result?: any) => void,
    ) => {
        try {
            const response = await Lib.Delivery.getPendingConversations(
                loadSession,
                pendingConversations,
                args.accountAddress,
                args.token,
            );
            if (!response) {
                throw Error('could not get pending conversations');
            }
            pendingConversations = response.pendingConversations;
            cb(null, {
                pendingConversations: response.pendingConversationsForAccount,
            });
        } catch (e) {
            cb({ code: 500, message: e });
        }
    },
    submitProfileRegistryEntry: async (
        args: {
            accountAddress: string;
            signedProfileRegistryEntry: Lib.SignedProfileRegistryEntry;
        },
        cb: (error: any, result?: any) => void,
    ) => {
        try {
            const token = await Lib.Delivery.submitProfileRegistryEntry(
                loadSession,
                storeSession,
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
    getProfileRegistryEntry: async (
        args: { accountAddress: string; token: string; keys: Lib.PublicKeys },
        cb: (error: any, result?: any) => void,
    ) => {
        try {
            const publicKeys = await Lib.Delivery.getProfileRegistryEntry(
                loadSession,
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
            // TODO: What to do after storage sync? Delete from delivery service?
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
        Lib.Delivery.getProfileRegistryEntry(loadSession, req.params.address),
    );
});

io.use(async (socket, next) => {
    const account = Lib.formatAddress(
        socket.handshake.auth.account.address as string,
    );

    if (
        !(await Lib.Delivery.checkToken(
            loadSession,
            account,
            socket.handshake.auth.token as string,
        ))
    ) {
        Lib.log(`[WS] Account ${account}: REJECTED`);
        return next(new Error('invalid username'));
    }
    const session = await loadSession(account);
    if (!session) {
        throw Error('Could not get session');
    }

    await storeSession(account, { ...session, socketId: socket.id });

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
    socket.on('submitMessage', async (data, callback) => {
        try {
            await Lib.Delivery.incomingMessage(
                data,
                loadSession,
                async (
                    conversationId: string,
                    envelop: Lib.EncryptionEnvelop,
                ) => {
                    if (redisClient) {
                        await redisClient.zAdd(
                            RedisPrefix.Conversation + conversationId,
                            {
                                score: new Date().getTime(),
                                value: JSON.stringify(envelop),
                            },
                        );
                    } else {
                        throw Error('db not connected');
                    }
                },
                (socketId: string, envelop: Lib.EncryptionEnvelop) => {
                    io.sockets.to(socketId).emit('message', envelop);
                },
            ),
                callback('success');
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('pendingMessage', async (data) => {
        try {
            pendingConversations = await Lib.Delivery.createPendingEntry(
                data.accountAddress,
                data.contactAddress,
                data.token,
                loadSession,
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
