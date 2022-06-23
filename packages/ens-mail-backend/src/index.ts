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

import Profiles from './profiles';
import Auth from './auth';
import Storage from './storage';

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
    app.locals.redisClient = redisClient;
    app.locals.loadSession = async (accountAddress: string) => {
        return redisClient ? getSession(accountAddress, redisClient) : null;
    };
    app.locals.storeSession = async (
        accountAddress: string,
        session: Lib.Delivery.Session,
    ) => {
        return redisClient
            ? setSession(accountAddress, session, redisClient)
            : null;
    };
    app.use('/profile', Profiles);
    app.use('/storage', Storage);
    app.use('/auth', Auth);
})();

// TODO include standalone web app
app.use(express.static(path.join(__dirname, '../build')));
const port = process.env.PORT || '8080';

const deliveryService = {
    getMessages: async (
        args: { accountAddress: string; contactAddress: string; token: string },
        cb: (error: any, result?: any) => void,
    ) => {
        try {
            const newMessages = await Lib.Delivery.getMessages(
                app.locals.loadSession,
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
                app.locals.loadSession,
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
                app.locals.loadSession,
                app.locals.storeSession,
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
                app.locals.loadSession,
                args.accountAddress,
            );

            cb(null, publicKeys);
        } catch (e) {
            cb({ code: 500, message: e });
        }
    },

    syncAcknoledgment: async (
        args: {
            accountAddress: string;
            token: string;
            acknoledgments: Lib.Delivery.Acknoledgment[];
            lastMessagePull: number;
        },
        cb: (error: any, result?: any) => void,
    ) => {
        try {
            Lib.log(`[syncAcknoledgment]`);
            const account = Lib.formatAddress(args.accountAddress);
            if (
                await Lib.Delivery.checkToken(
                    app.locals.loadSession,
                    account,
                    args.token,
                )
            ) {
                await Promise.all(
                    args.acknoledgments.map(async (ack) => {
                        const conversationId = Lib.getConversationId(
                            account,
                            ack.contactAddress,
                        );

                        if (redisClient) {
                            const redisKey =
                                RedisPrefix.Conversation +
                                conversationId +
                                ':sync';

                            await redisClient.hSet(
                                redisKey,
                                account,
                                args.lastMessagePull,
                            );

                            const syncTimestamps = Object.values(
                                await redisClient.hGetAll(redisKey),
                            );

                            // TODO: check if both using this delivery service
                            if (syncTimestamps.length === 2) {
                                const lowestTimestamp =
                                    parseInt(syncTimestamps[0]) >
                                    parseInt(syncTimestamps[1])
                                        ? parseInt(syncTimestamps[1])
                                        : parseInt(syncTimestamps[0]);

                                const deletedMessagesCounter =
                                    await redisClient.zRemRangeByScore(
                                        RedisPrefix.Conversation +
                                            conversationId,
                                        0,
                                        lowestTimestamp,
                                    );
                                Lib.log(
                                    `- Deleted ${deletedMessagesCounter} deliverd messages`,
                                );
                            }
                        } else {
                            throw Error('db not connected');
                        }
                    }),
                );

                // TODO: What to do after storage sync? Delete from delivery service?
                cb(null, 'success');
            } else {
                cb({ code: 401, message: 'Token check failed' });
            }
        } catch (e) {
            cb({ code: 500, message: e });
        }
    },
};

const jaysonServer = new jayson.server(deliveryService);
app.post('/deliveryService', jaysonServer.middleware());

io.use(async (socket, next) => {
    const account = Lib.formatAddress(
        socket.handshake.auth.account.address as string,
    );

    if (
        !(await Lib.Delivery.checkToken(
            app.locals.loadSession,
            account,
            socket.handshake.auth.token as string,
        ))
    ) {
        Lib.log(`[WS] Account ${account}: REJECTED`);
        return next(new Error('invalid username'));
    }
    const session = await app.locals.loadSession(account);
    if (!session) {
        throw Error('Could not get session');
    }

    await app.locals.storeSession(account, { ...session, socketId: socket.id });

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
                app.locals.loadSession,
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
                app.locals.loadSession,
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
