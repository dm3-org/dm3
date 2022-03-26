import { ethers } from 'ethers';
import { PublicKeys } from '..';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { log } from '../shared/log';
import { Session } from './Session';
import { v4 as uuidv4 } from 'uuid';

export function submitPublicKeys(
    sessions: Map<string, Session>,
    accountAddress: string,
    publicKeys: PublicKeys,
    signature: string,
    pendingConversations: Map<string, Set<string>>,
    send: (socketId: string) => void,
): string {
    log(`[submitKeys] for account ${accountAddress}`);
    const account = formatAddress(accountAddress);

    const recoveredAddress = ethers.utils.recoverAddress(
        ethers.utils.hashMessage(
            publicKeys.publicKey +
                publicKeys.publicMessagingKey +
                publicKeys.publicSigningKey,
        ),
        signature,
    );

    if (formatAddress(recoveredAddress) === account) {
        const session = sessions.has(account)
            ? (sessions.get(account) as Session)
            : { account };
        session.keys = publicKeys;
        session.token = uuidv4();
        session.pubKeySignature = signature;
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
        throw Error('Signature invalid.');
    }
}

export function getPublicKeys(
    sessions: Map<string, Session>,
    accountAddress: string,
): Partial<{ publicKeys: PublicKeys | undefined; signature: string }> {
    log(`[getPublicKeys] for account ${accountAddress}`);
    const account = formatAddress(accountAddress);

    if (sessions.get(account)?.keys) {
        return {
            publicKeys: {
                publicMessagingKey:
                    sessions.get(account)?.keys!.publicMessagingKey!,
                publicSigningKey:
                    sessions.get(account)?.keys!.publicSigningKey!,
                publicKey: sessions.get(account)?.keys!.publicKey!,
            },
            signature: sessions.get(account)?.pubKeySignature,
        };
    } else {
        return {};
    }
}
