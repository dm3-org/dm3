import { decryptAsymmetric } from 'dm3-lib-crypto';
import { EncryptionEnvelop, Postmark, MessageState } from 'dm3-lib-messaging';
import { log } from 'dm3-lib-shared';
import { UserDB } from 'dm3-lib-storage';
import { requestContacts } from '../../adapters/contacts';
import { Connection } from '../../interfaces/web3';
import {
    Actions,
    ConnectionState,
    GlobalState,
    UserDbType,
} from '../../utils/enum-type-utils';
import { Config } from '../../interfaces/config';
import { Account } from 'dm3-lib-profile';

export function showSignIn(connectionState: ConnectionState): boolean {
    return (
        connectionState === ConnectionState.AccountConnectReady ||
        connectionState === ConnectionState.SignInReady ||
        connectionState === ConnectionState.CollectingSignInData ||
        connectionState === ConnectionState.WaitingForAccountConnection ||
        connectionState === ConnectionState.WaitingForSignIn ||
        connectionState === ConnectionState.ConnectionRejected ||
        connectionState === ConnectionState.SignInFailed
    );
}

export function connectionPhase(connectionState: ConnectionState): boolean {
    return (
        connectionState === ConnectionState.WaitingForAccountConnection ||
        connectionState === ConnectionState.ConnectionRejected ||
        connectionState === ConnectionState.AccountConnectReady
    );
}

// method to fetch entire contact list of connected account
export const getContacts = (
    account: Account,
    dsToken: string,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    config: Config,
) => {
    if (!state.userDb) {
        throw Error(
            `[getContacts] Couldn't handle new messages. User db not created.`,
        );
    }

    log('[getContacts]', 'info');

    return requestContacts(account, dsToken, state, dispatch, config);
};

// method to handle new messages received
export const handleNewMessage = async (
    account: Account,
    envelop: EncryptionEnvelop,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
) => {
    log('New messages', 'info');

    const message = JSON.parse(
        await decryptAsymmetric(
            (state.userDb as UserDB).keys.encryptionKeyPair,
            JSON.parse(envelop.message),
        ),
    );
    const postmark: Postmark = JSON.parse(
        await decryptAsymmetric(
            (state.userDb as UserDB).keys.encryptionKeyPair,
            JSON.parse(envelop.postmark!),
        ),
    );

    if (!state.userDb) {
        throw Error(
            `[handleNewMessage] Couldn't handle new messages. User db not created.`,
        );
    }

    if (!postmark.incommingTimestamp) {
        throw Error(`[handleNewMessage] No delivery service timestamp`);
    }

    dispatch({
        type: UserDbType.addMessage,
        payload: {
            container: {
                envelop: {
                    message,
                    postmark,
                    metadata: envelop.metadata,
                },
                messageState: MessageState.Send,
                deliveryServiceIncommingTimestamp: postmark.incommingTimestamp,
            },
            account,
        },
    });
};
