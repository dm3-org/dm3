import {
    SignedUserProfile,
    checkUserProfile,
    normalizeEnsName,
} from 'dm3-lib-profile';
import { getDefaultProfileExtension } from 'dm3-lib-profile';
import { Session } from './Session';
import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';

const handlePendingConversations = async (
    ensName: string,
    getSession: (accountAddress: string) => Promise<Session | null>,
    getPendingConversations: (accountAddress: string) => Promise<string[]>,
    send: (socketId: string) => void,
) => {
    const pending = await getPendingConversations(ensName);

    await Promise.all(
        pending.map(async (pendingEntry) => {
            const contact = normalizeEnsName(pendingEntry);
            const contactSession = await getSession(contact);

            if (contactSession?.socketId) {
                send(contactSession.socketId);
            }
        }),
    );
};

export async function submitUserProfile(
    provider: ethers.providers.JsonRpcProvider,
    getSession: (accountAddress: string) => Promise<Session | null>,
    setSession: (accountAddress: string, session: Session) => Promise<void>,
    ensName: string,
    signedUserProfile: SignedUserProfile,
    getPendingConversations: (accountAddress: string) => Promise<string[]>,
    send: (socketId: string) => void,
): Promise<string> {
    const account = normalizeEnsName(ensName);

    if (!(await checkUserProfile(provider, signedUserProfile, account))) {
        throw Error('Signature invalid.');
    }
    //TODO:  remvoe DISABLE_SESSION_CHECK
    // DISABLE_SESSION_CHECK is a special solution for ETH Prague
    if (
        process.env.DISABLE_SESSION_CHECK !== 'true' &&
        (await getSession(account))
    ) {
        throw Error('Profile exists already');
    }
    const session: Session = {
        account,
        signedUserProfile,
        token: uuidv4(),
        createdAt: new Date().getTime(),
        profileExtension: getDefaultProfileExtension(),
    };

    await setSession(account.toLocaleLowerCase(), session);
    await handlePendingConversations(
        account,
        getSession,
        getPendingConversations,
        send,
    );

    return session.token;
}

export async function getUserProfile(
    getSession: (accountAddress: string) => Promise<Session | null>,
    ensName: string,
): Promise<SignedUserProfile | undefined> {
    const account = normalizeEnsName(ensName);
    const session = await getSession(account);
    return session?.signedUserProfile;
}
