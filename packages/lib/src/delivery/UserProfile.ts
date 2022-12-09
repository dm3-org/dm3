import { SignedUserProfile, checkUserProfile } from '../account/Account';
import { getDefaultProfileExtension } from '../account/profileExtension/ProfileExtension';
import { formatAddress } from '../external-apis';
import { Session } from './Session';
import { v4 as uuidv4 } from 'uuid';

const handlePendingConversations = async (
    account: string,
    getSession: (accountAddress: string) => Promise<Session | null>,
    getPendingConversations: (accountAddress: string) => Promise<string[]>,
    send: (socketId: string) => void,
) => {
    const pending = await getPendingConversations(account);
    await Promise.all(
        pending.map(async (pendingEntry) => {
            const contact = formatAddress(pendingEntry);
            const contactSession = await getSession(contact);

            if (contactSession?.socketId) {
                send(contactSession.socketId);
            }
        }),
    );
};

export async function submitUserProfile(
    getSession: (accountAddress: string) => Promise<Session | null>,
    setSession: (accountAddress: string, session: Session) => Promise<void>,
    accountAddress: string,
    signedUserProfile: SignedUserProfile,
    getPendingConversations: (accountAddress: string) => Promise<string[]>,
    send: (socketId: string) => void,
): Promise<string> {
    const account = formatAddress(accountAddress);

    if (!checkUserProfile(signedUserProfile, account)) {
        throw Error('Signature invalid.');
    }
    if (await getSession(account)) {
        throw Error('Profile exists already');
    }

    const session: Session = {
        account,
        signedUserProfile,
        token: uuidv4(),
        createdAt: new Date().getTime(),
        profileExtension: getDefaultProfileExtension(),
    };

    await setSession(account, session);

    await handlePendingConversations(
        accountAddress,
        getSession,
        getPendingConversations,
        send,
    );
    return session.token;
}

export async function getUserProfile(
    getSession: (accountAddress: string) => Promise<Session | null>,
    accountAddress: string,
): Promise<SignedUserProfile | undefined> {
    const account = formatAddress(accountAddress);
    const session = await getSession(account);
    return session?.signedUserProfile;
}
