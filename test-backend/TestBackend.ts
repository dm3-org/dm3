import { ethers } from 'ethers';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import { getSessionToken } from '../src/lib/Web3Provider';
import { checkToken, Session } from './BackendLib';
import { Envelop, Message } from '../src/lib/Messaging';

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

const sessions = new Map<string, Session>();
const contacts = new Map<string, Set<string>>();
const messages = new Map<string, Map<string, Message[]>>();

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
        console.log(req.body.signature);
        console.log(
            `Session key for ${account} set to ${sessions.get(account)?.token}`,
        );
    } else {
        res.status(401).send('sign in failed');
        console.log(`Failed to set session key for ${account}`);
    }
});

app.post('/addContact/:accountAddress', (req, res) => {
    console.log('[addContact]');
    const account = ethers.utils.getAddress(req.params.accountAddress);
    if (checkToken(sessions, account, req.body.token)) {
        const accountContacts: Set<string> = (
            contacts.has(account) ? contacts.get(account) : new Set<string>()
        ) as Set<string>;
        accountContacts.add(req.body.contactAddress);

        if (!contacts.has(account)) {
            contacts.set(account, accountContacts);
        }
        console.log(
            `Added ${req.body.contactAddress} to the contact list of ${account}`,
        );
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

        res.send({ contacts: accountContacts });
    } else {
        res.status(401).send('Token check failed');
    }
});

app.post('/submitMessage/:accountAddress', (req, res) => {
    console.log(`[submitMessage]`);
    const account = ethers.utils.getAddress(req.params.accountAddress);
    const contact = ethers.utils.getAddress(
        (JSON.parse(req.body.envelop.message) as Message).to,
    );

    if (checkToken(sessions, account, req.body.token)) {
        const accountMessages = (
            messages.has(account)
                ? messages.get(account)
                : new Map<string, any[]>()
        ) as Map<string, any[]>;

        const accountContactMessages = (
            accountMessages.has(contact) ? accountMessages.get(contact) : []
        ) as Message[];

        accountContactMessages.push(req.body.message);

        if (!accountMessages.has(contact)) {
            accountMessages.set(contact, accountContactMessages);
        }

        if (!messages.has(account)) {
            messages.set(account, accountMessages);
        }

        res.send('OK');
    } else {
        res.status(401).send('Token check failed)');
    }
});

app.post('/getMessages/:accountAddress', (req, res) => {
    console.log(`[submitMessage]`);
    const account = ethers.utils.getAddress(req.params.accountAddress);
    const contact = ethers.utils.getAddress(req.body.contact);

    if (checkToken(sessions, account, req.body.token)) {
        res.send({
            messages: messages.get(account)?.has(contact)
                ? (messages.get(account) as Map<string, Message[]>).get(contact)
                : [],
        });
    } else {
        res.status(401).send('Token check failed)');
    }
});

app.listen(3003);
