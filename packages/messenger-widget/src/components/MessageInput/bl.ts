import {
    createEditMessage,
    createMessage,
    Message,
    SendDependencies,
} from 'dm3-lib-messaging';
import { log } from 'dm3-lib-shared';
import { StorageEnvelopContainer } from 'dm3-lib-storage';
import { submitMessage } from '../../adapters/messages';
import {
    Actions,
    GlobalState,
    MessageActionType,
    UiViewStateType,
    UserDbType,
} from '../../utils/enum-type-utils';
import { Account, ProfileKeys } from 'dm3-lib-profile';

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

    const messageData = await createMessage(
        state.accounts.selectedContact.account.ensName,
        state.connection.account!.ensName,
        message,
        userDb.keys.signingKeyPair.privateKey,
    );

    const haltDelivery = getHaltDelivery(state);
    const sendDependencies: SendDependencies = getDependencies(state);

    await sendMessage(
        state,
        sendDependencies,
        messageData,
        haltDelivery,
        dispatch,
    );

    setMessage('');
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

    if (
        state.uiView.selectedMessageView.actionType === MessageActionType.EDIT
    ) {
        await editMessage(state, dispatch, message, setMessage);
    } else {
        await handleNewUserMessage(message, setMessage, state, dispatch);
    }
};

const editMessage = async (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    message: string,
    setMessage: Function,
) => {
    const userDb = state.userDb;

    if (!userDb) {
        throw Error('userDB not found');
    }

    if (!state.accounts.selectedContact) {
        throw Error('no contact selected');
    }

    const referenceMessageHash =
        state.uiView.selectedMessageView.messageData?.envelop.metadata
            ?.encryptedMessageHash;

    dispatch({
        type: UiViewStateType.SetMessageView,
        payload: {
            actionType: MessageActionType.NONE,
            messageData: undefined,
        },
    });

    // edit the original message
    const messageData = await createEditMessage(
        state.accounts.selectedContact?.account.ensName as string,
        state.connection.account!.ensName,
        message,
        userDb.keys.signingKeyPair.privateKey as string,
        referenceMessageHash as string,
    );

    const haltDelivery = getHaltDelivery(state);
    const sendDependencies: SendDependencies = getDependencies(state);

    await sendMessage(
        state,
        sendDependencies,
        messageData,
        haltDelivery,
        dispatch,
    );

    setMessage('');
};

const getHaltDelivery = (state: GlobalState): boolean => {
    return state.accounts.selectedContact?.account.profile
        ?.publicEncryptionKey &&
        state.connection.account?.profile?.publicEncryptionKey
        ? false
        : true;
};

const getDependencies = (state: GlobalState): SendDependencies => {
    return {
        deliverServiceProfile:
            state.accounts.selectedContact?.deliveryServiceProfile!,
        from: state.connection.account!,
        to: state.accounts.selectedContact?.account as Account,
        keys: state.userDb?.keys as ProfileKeys,
    };
};

const sendMessage = async (
    state: GlobalState,
    sendDependencies: SendDependencies,
    messageData: Message,
    haltDelivery: boolean,
    dispatch: React.Dispatch<Actions>,
) => {
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
    } catch (e) {
        log('[handleNewUserMessage] ' + JSON.stringify(e), 'error');
    }
};
