import { Keys } from '../account/Account';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { log } from '../shared/log';
import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';
import { getSessionToken } from '../signin/SignIn';

export interface Session {
    account: string;
    challenge?: string;
    token?: string;
    ttl?: undefined;
    socketId?: string;
    keys?: Partial<Keys>;
}

export function requestSignInChallenge(
    sessions: Map<string, Session>,
    accountAddress: string,
) {
    log('[requestSignInChallenge]');

    const account = formatAddress(accountAddress);
    const session = sessions.has(account)
        ? (sessions.get(account) as Session)
        : { account };
    session.challenge = `ENS Mail Sign In ${uuidv4()}`;
    sessions.set(account, session);

    return {
        challenge: session.challenge,
        hasKeys: session.keys ? true : false,
    };
}

export function submitSignedChallenge(
    sessions: Map<string, Session>,
    challenge: string,
    signature: string,
) {
    log('[submitSignedChallenge]');
    const account = ethers.utils.recoverAddress(
        ethers.utils.hashMessage(challenge),
        signature,
    );
    const session = sessions.get(account);
    if (session && session?.challenge === challenge) {
        session.token = getSessionToken(signature);
        log(
            `- Session key for ${account} set to ${
                sessions.get(account)?.token
            }`,
        );
    } else {
        log(`- Failed to set session key for ${account}`);
        throw Error(`Failed to set session key for ${account}`);
    }
}

export function checkToken(
    sessions: Map<string, Session>,
    accountAddress: string,
    token: string,
): boolean {
    const account = formatAddress(accountAddress);
    const session = sessions.get(account);
    const passed = session && session?.token === token;
    log(`- Token check for ${account}: ${passed ? 'PASSED' : 'FAILED'}`);
    return passed ? true : false;
}
