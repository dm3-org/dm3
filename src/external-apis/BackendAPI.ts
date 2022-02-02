import axios from 'axios';
import { ApiConnection } from '../lib/Web3Provider';

export async function submitSignedChallenge(
    challenge: string,
    signature: string,
) {
    await axios.post(
        (process.env.REACT_APP_BACKEND as string) + '/submitSignedChallenge',
        { challenge, signature },
    );
}

export async function requestChallenge(account: string): Promise<string> {
    return (
        await axios.post(
            (process.env.REACT_APP_BACKEND as string) +
                '/requestSignInChallenge',
            { account },
        )
    ).data.challenge;
}

export async function addContact(
    apiConnection: ApiConnection,
    contactAddress: string,
): Promise<string> {
    return (
        await axios.post(
            ((process.env.REACT_APP_BACKEND as string) +
                '/addContact/' +
                apiConnection.account) as string,
            { contactAddress, token: apiConnection.sessionToken },
        )
    ).data.challenge;
}

export async function getContacts(
    account: string,
    token: string,
): Promise<string[]> {
    return (
        await axios.post(
            (process.env.REACT_APP_BACKEND as string) +
                '/getContacts/' +
                account,
            { token },
        )
    ).data.contacts;
}
