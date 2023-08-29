import { createMessage, SendDependencies } from 'dm3-lib-messaging';
import { log } from 'dm3-lib-shared';
import { StorageEnvelopContainer } from 'dm3-lib-storage';
import { submitMessage } from '../../adapters/messages';
import { Actions, GlobalState, UserDbType } from '../../utils/enum-type-utils';

const handleNewUserMessage = async (
    message: string,
    setMessage: Function,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
) => {
    const userDb = state.userDb;

    if (!userDb) {
        throw Error('userDB not found');
    }

    if (!state.accounts.selectedContact) {
        throw Error('no contact selected');
    }

    const haltDelivery =
        state.accounts.selectedContact?.account.profile?.publicEncryptionKey &&
        state.connection.account?.profile?.publicEncryptionKey
            ? false
            : true;

    const messageData = await createMessage(
        state.accounts.selectedContact.account.ensName,
        state.connection.account!.ensName,
        message,
        userDb.keys.signingKeyPair.privateKey,
    );

    const sendDependencies: SendDependencies = {
        deliverServiceProfile:
            state.accounts.selectedContact.deliveryServiceProfile!,
        from: state.connection.account!,
        to: state.accounts.selectedContact.account,
        keys: userDb.keys,
    };

    try {
        await submitMessage(
            state.connection,
            state.auth.currentSession?.token!,
            sendDependencies,
            messageData,
            haltDelivery,
            (envelops: StorageEnvelopContainer[]) =>
                envelops.forEach((envelop) =>
                    dispatch({
                        type: UserDbType.addMessage,
                        payload: {
                            container: envelop,
                            connection: state.connection,
                        },
                    }),
                ),
        );

        // empty input field
        setMessage('');
    } catch (e) {
        log('[handleNewUserMessage] ' + JSON.stringify(e), 'error');
    }
};

export const handleSubmit = async (
    message: string,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    setMessage: Function,
    event:
        | React.FormEvent<HTMLFormElement>
        | React.MouseEvent<HTMLImageElement, MouseEvent>,
) => {
    event.preventDefault();
    if (!message.trim().length) {
        return;
    }
    await handleNewUserMessage(message, setMessage, state, dispatch);
};
