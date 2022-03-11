import { ethers } from 'ethers';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { checkToken, Session } from './BackendLib';
import { Server } from 'socket.io';
import http from 'http';
import { addContact, incomingMessage } from './Messaging';
import path from 'path';
import * as Lib from '../src/lib';
import cors from 'cors';

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

const sessions = new Map<string, Session>();
const contacts = new Map<string, Set<string>>();
const messages = new Map<string, (Lib.EncryptionEnvelop | Lib.Envelop)[]>();

app.use(express.static(path.join(__dirname, '../build')));
const port = process.env.PORT || '8080';

app.post('/requestSignInChallenge', (req, res) => {
    console.log('[requestSignInChallenge]');
    const account = Lib.formatAddress(req.body.account);
    const session = sessions.has(account)
        ? (sessions.get(account) as Session)
        : { account };
    session.challenge = `ENS Mail Sign In ${uuidv4()}`;
    sessions.set(account, session);
    res.send({
        challenge: session.challenge,
        hasEncryptionKey: session.encryptedKeys ? true : false,
    });
});

app.post('/submitSignedChallenge', (req, res) => {
    console.log('[submitSignedChallenge]');
    const account = ethers.utils.recoverAddress(
        ethers.utils.hashMessage(req.body.challenge),
        req.body.signature,
    );
    const session = sessions.get(account);
    if (session && session?.challenge === req.body.challenge) {
        session.token = Lib.getSessionToken(req.body.signature);
        res.send('signed in');
        console.log(
            `- Session key for ${account} set to ${
                sessions.get(account)?.token
            }`,
        );
    } else {
        res.status(401).send('sign in failed');
        console.log(`- Failed to set session key for ${account}`);
    }
});

app.post('/addContact/:accountAddress', (req, res) => {
    console.log('[addContact]');
    const account = Lib.formatAddress(req.params.accountAddress);
    if (checkToken(sessions, account, req.body.token)) {
        addContact(contacts, account, req.body.contactAddress);

        res.send('OK');
    } else {
        res.status(401).send('Token check failed)');
    }
});

app.post('/getContacts/:accountAddress', (req, res) => {
    console.log('[getContacts]');
    const account = Lib.formatAddress(req.params.accountAddress);

    if (checkToken(sessions, account, req.body.token)) {
        const accountContacts = contacts.has(account)
            ? Array.from(contacts.get(account) as Set<string>)
            : [];

        res.send(
            accountContacts.map((address) => ({
                address,
                keys: {
                    publicMessagingKey:
                        sessions.has(address) &&
                        (sessions.get(address) as Session).encryptedKeys
                            ? (
                                  (sessions.get(address) as Session)
                                      .encryptedKeys as Lib.EncryptedKeys
                              ).publicMessagingKey
                            : undefined,
                    publicSigningKey:
                        sessions.has(address) &&
                        (sessions.get(address) as Session).encryptedKeys
                            ? (
                                  (sessions.get(address) as Session)
                                      .encryptedKeys as Lib.EncryptedKeys
                              ).publicSigningKey
                            : undefined,
                },
            })),
        );
    } else {
        res.status(401).send('Token check failed');
    }
});

app.post('/getMessages/:accountAddress', (req, res) => {
    console.log(`[getMessages]`);
    const account = Lib.formatAddress(req.params.accountAddress);
    const contact = Lib.formatAddress(req.body.contact);
    const conversationId = Lib.getConversationId(contact, account);
    console.log(`- Conversations id: ${conversationId}`);

    if (checkToken(sessions, account, req.body.token)) {
        const receivedMessages: (Lib.EncryptionEnvelop | Lib.Envelop)[] = (
            messages.has(conversationId) ? messages.get(conversationId) : []
        ) as (Lib.EncryptionEnvelop | Lib.Envelop)[];

        const forAccount = receivedMessages.filter(
            (envelop) =>
                Lib.formatAddress(Lib.getEnvelopMetaData(envelop).to) ===
                account,
        );

        console.log(`- ${receivedMessages?.length} messages`);
        res.send({
            messages: forAccount,
        });

        // remove deliverd messages
        messages.set(
            conversationId,
            receivedMessages.filter(
                (envelop) =>
                    Lib.formatAddress(Lib.getEnvelopMetaData(envelop).to) !==
                    account,
            ),
        );
    } else {
        res.status(401).send('Token check failed)');
    }
});

app.post('/submitKeys/:accountAddress', (req, res) => {
    console.log(`[submitKeys] Public key: ${req.body.keys.publicMessagingKey}`);
    const account = Lib.formatAddress(req.params.accountAddress);

    if (checkToken(sessions, account, req.body.token)) {
        (sessions.get(account) as Session).encryptedKeys = req.body.keys;
        res.send('submitted');
    } else {
        res.status(401).send('Token check failed)');
    }
});

app.get('/getPublicKeys/:accountAddress', (req, res) => {
    console.log(`[GET publicKey] Public key: ${req.params.accountAddress}`);
    const account = Lib.formatAddress(req.params.accountAddress);

    if (sessions.get(account)?.encryptedKeys) {
        res.send({
            publicMessagingKey:
                sessions.get(account)?.encryptedKeys?.publicMessagingKey,
            publicSigningKey:
                sessions.get(account)?.encryptedKeys?.publicSigningKey,
        });
    } else {
        res.send({});
    }
});

app.post('/getKeys/:accountAddress', (req, res) => {
    console.log(`[getKeys] Account address: ${req.params.accountAddress}`);
    const account = Lib.formatAddress(req.params.accountAddress);

    if (checkToken(sessions, account, req.body.token)) {
        res.send({ keys: sessions.get(account)?.encryptedKeys });
    } else {
        res.status(401).send('Token check failed)');
    }
});

io.use((socket, next) => {
    const account = Lib.formatAddress(
        socket.handshake.auth.account.address as string,
    );

    if (!checkToken(sessions, account, socket.handshake.auth.token as string)) {
        console.log(`[WS] Account ${account}: REJECTED`);
        return next(new Error('invalid username'));
    }
    const session = sessions.get(account) as Session;
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
            incomingMessage(
                data,
                sessions,
                messages,
                socket,
                contacts,
                callback,
            );
        } catch (e) {
            console.error(e);
        }
    });
});

server.listen(port, () => {
    console.log('[Server] listening');
});
