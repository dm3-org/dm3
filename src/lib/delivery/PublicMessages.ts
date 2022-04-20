import { formatAddress } from '../external-apis/InjectedWeb3API';
import { log } from '../shared/log';
import { checkToken, Session } from './Session';
import { PublicEnvelop } from '../messaging/PublicMessaging';
import { checkSignature } from '../encryption/Encryption';
import { getId } from '../messaging/Utils';

// returns the the URL pointing to the most recent message
// posted by the specified account
export function getPublicMessageHead(
    messageHeads: Map<string, string>,
    accountAddress: string,
) {
    const headUrl = messageHeads.get(accountAddress);
    log(
        `[getPublicMessages] ${accountAddress} last post was ${
            headUrl ? headUrl : 'none'
        }`,
    );
    return headUrl;
}

// handle a new incoming public message
export function incomingPublicMessage(
    data: { envelop: PublicEnvelop; token: string },
    sessions: Map<string, Session>,
    messageHeads: Map<string, string>,
    publicMessages: Map<string, PublicEnvelop>,
): {
    messageHeads: Map<string, string>;
    publicMessages: Map<string, PublicEnvelop>;
} {
    log('[incomingPublicMessage]');
    const account = formatAddress(data.envelop.message.from);

    if (!checkToken(sessions, account, data.token)) {
        throw Error('Token check failed');
    }
    const publicSigKey =
        sessions.get(account)!.signedProfileRegistryEntry.profileRegistryEntry
            .publicKeys.publicSigningKey;

    if (
        !checkSignature(
            data.envelop.message,
            publicSigKey,
            account,
            data.envelop.signature,
        )
    ) {
        throw Error('Signature check failed');
    }

    const newMessageHeads = new Map<string, string>(messageHeads);
    newMessageHeads.set(account, getId(data.envelop));
    const newPublicMessages = new Map<string, PublicEnvelop>(publicMessages);
    newPublicMessages.set(getId(data.envelop), data.envelop);

    return {
        messageHeads: newMessageHeads,
        publicMessages: newPublicMessages,
    };
}
