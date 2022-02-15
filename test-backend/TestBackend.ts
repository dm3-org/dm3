import { ethers } from 'ethers';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import { getSessionToken, Keys } from '../src/lib/Web3Provider';
import { checkToken, Session } from './BackendLib';
import { EncryptionEnvelop, Envelop, Message } from '../src/lib/Messaging';
import { Server } from 'socket.io';
import http from 'http';
import { addContact, getConversationId, incomingMessage } from './Messaging';

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    }),
);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

const sessions = new Map<string, Session>();
const contacts = new Map<string, Set<string>>();
const messages = new Map<string, (EncryptionEnvelop | Envelop)[]>();

app.post('/requestSignInChallenge', (req, res) => {
    console.log('[requestSignInChallenge]');
    const account = ethers.utils.getAddress(req.body.account);
    const session = sessions.has(account)
        ? (sessions.get(account) as Session)
        : { account };
    session.challenge = `ENS Mail Sign In ${uuidv4()}`;
    sessions.set(account, session);
    res.send({ challenge: session.challenge });
});

app.post('/submitSignedChallenge', (req, res) => {
    console.log('[submitSignedChallenge]');
    const account = ethers.utils.recoverAddress(
        ethers.utils.hashMessage(req.body.challenge),
        req.body.signature,
    );
    const session = sessions.get(account);
    if (session && session?.challenge === req.body.challenge) {
        session.token = getSessionToken(req.body.signature);
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
    const account = ethers.utils.getAddress(req.params.accountAddress);
    if (checkToken(sessions, account, req.body.token)) {
        addContact(contacts, account, req.body.contactAddress);

        res.send('OK');
    } else {
        res.status(401).send('Token check failed)');
    }
});

app.post('/getContacts/:accountAddress', (req, res) => {
    console.log('[getContacts]');
    const account = ethers.utils.getAddress(req.params.accountAddress);

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
                                      .encryptedKeys as Keys
                              ).publicMessagingKey
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
    const account = ethers.utils.getAddress(req.params.accountAddress);
    const contact = ethers.utils.getAddress(req.body.contact);
    const conversationId = getConversationId(contact, account);
    console.log(`- Conversations id: ${conversationId}`);

    if (checkToken(sessions, account, req.body.token)) {
        const receivedMessages = messages.has(conversationId)
            ? messages.get(conversationId)
            : ([] as Envelop[]);
        console.log(`- ${receivedMessages?.length} messages`);
        res.send({
            messages: receivedMessages,
        });
    } else {
        res.status(401).send('Token check failed)');
    }
});

app.post('/submitKeys/:accountAddress', (req, res) => {
    console.log(`[submitKeys] Public key: ${req.body.keys.publicMessagingKey}`);
    const account = ethers.utils.getAddress(req.params.accountAddress);

    if (checkToken(sessions, account, req.body.token)) {
        (sessions.get(account) as Session).encryptedKeys = req.body.keys;
        res.send('submitted');
    } else {
        res.status(401).send('Token check failed)');
    }
});

app.get('/publicKey/:accountAddress', (req, res) => {
    console.log(`[GET publicKey] Public key: ${req.params.accountAddress}`);
    const account = ethers.utils.getAddress(req.params.accountAddress);

    if (sessions.get(account)?.encryptedKeys) {
        res.send({
            publicKey: sessions.get(account)?.encryptedKeys?.publicMessagingKey,
        });
    } else {
        res.send({});
    }
});

app.post('/getKeys/:accountAddress', (req, res) => {
    console.log(`[getKeys] Account address: ${req.params.accountAddress}`);
    const account = ethers.utils.getAddress(req.params.accountAddress);

    if (checkToken(sessions, account, req.body.token)) {
        res.send({ keys: sessions.get(account)?.encryptedKeys });
    } else {
        res.status(401).send('Token check failed)');
    }
});

io.use((socket, next) => {
    const account = ethers.utils.getAddress(
        socket.handshake.auth.account.address as string,
    );

    if (!checkToken(sessions, account, socket.handshake.auth.token as string)) {
        console.log(`[WS] Account ${account}: REJECTED`);
        return next(new Error('invalid username'));
    }
    const session = sessions.get(account) as Session;
    session.socketId = socket.id;
    console.log(`[WS] Account ${account}: CONNECTED`);
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
    socket.on('submitMessage', (data) => {
        console.log('[WS] incoming message');
        try {
            incomingMessage(data, sessions, messages, socket, contacts);
        } catch (e) {
            console.error(e);
        }
    });
});

server.listen(3003, () => {
    console.log('[Server] listening');
});
