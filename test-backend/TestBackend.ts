import { ethers } from 'ethers';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import { getSessionToken } from '../src/lib/Web3Provider';

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

interface Session {
    account: string;
    challenge?: string;
    token?: string;
    ttl?: undefined;
}

const sessions = new Map<string, Session>();

app.post('/requestSignInChallenge', (req, res) => {
    const account = ethers.utils.getAddress(req.body.account);
    const session = sessions.has(account)
        ? (sessions.get(account) as Session)
        : { account };
    session.challenge = `ENS Mail Sign In ${uuidv4()}`;
    sessions.set(account, session);
    res.send({ challenge: session.challenge });
});

app.post('/submitSignedChallenge', (req, res) => {
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

app.listen(3003);
