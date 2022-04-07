import { ethers } from 'ethers';
import { PublicKeys } from '..';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { log } from '../shared/log';
import { Session } from './Session';
import { v4 as uuidv4 } from 'uuid';
import { ProfileRegistryEntry } from '../account/Account';

export function submitProfileRegistryEntry(
    sessions: Map<string, Session>,
    accountAddress: string,
    profileRegistryEntry: ProfileRegistryEntry,
    signature: string,
    pendingConversations: Map<string, Set<string>>,
    send: (socketId: string) => void,
): string {
    log(`[submitKeys] for account ${accountAddress}`);
    const account = formatAddress(accountAddress);

    const recoveredAddress = ethers.utils.recoverAddress(
        ethers.utils.hashMessage(JSON.stringify(profileRegistryEntry)),
        signature,
    );

    if (formatAddress(recoveredAddress) === account) {
        const session: Session = {
            ...(sessions.has(account) ? sessions.get(account)! : {}),
            account,
            profileRegistryEntry: profileRegistryEntry,
            token: uuidv4(),
            profileRegistryEntrySignature: signature,
        };

        sessions.set(account, session);
        const pending = pendingConversations.get(account);
        if (pending) {
            pending.forEach((pendingEntry) => {
                const contact = formatAddress(pendingEntry);
                const contactSession = sessions.get(contact);
                if (contactSession?.socketId) {
                    log(`- Send join notification to ${contact}`);
                    send(contactSession.socketId);
                }
            });
        }
        return session.token;
    } else {
        log(`- Invalid signature`);
        throw Error('Signature invalid.');
    }
}

export function getProfileRegistryEntry(
    sessions: Map<string, Session>,
    accountAddress: string,
):
    | { profileRegistryEntry: ProfileRegistryEntry; signature: string }
    | undefined {
    log(`[getProfileRegistryEntry] for account ${accountAddress}`);
    const account = formatAddress(accountAddress);
    const session = sessions.get(account);
    if (session) {
        return {
            profileRegistryEntry: session.profileRegistryEntry,
            signature: session.profileRegistryEntrySignature,
        };
    } else {
        return;
    }
}
